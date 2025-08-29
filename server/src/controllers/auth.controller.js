import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import { generateOTP, generateToken, sendOTPEmail } from "../utils/helper.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken"

const otpStore = new Map();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    if (!name || !email || !password) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json(new ApiError(400, "Email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userData: { name, email, password: hashedPassword },
    });

    await sendOTPEmail(email, otp);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "OTP sent to email. Please verify to complete signup."
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json(new ApiError(400, "Email and OTP are required"));
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res
        .status(400)
        .json(new ApiError(400, "No OTP found for this email"));
    }

    if (Date.now() > storedData.expiry) {
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).json(new ApiError(400, "OTP has expired"));
    }

    if (storedData.otp !== otp) {
      return res.status(400).json(new ApiError(400, "Invalid OTP"));
    }

    const user = await prisma.user.create({
      data: {
        name: storedData.userData.name,
        email: storedData.userData.email,
        password: storedData.userData.password,
        role: "LEARNER",
      },
    });

    otpStore.delete(email);

    res
      .status(201)
      .json(new ApiResponse(201, user, "Account created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    // ✅ Create JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileUrl: user.profileUrl,
      },
      redirectTo:
        user.role === "INSTRUCTOR"
          ? "/instructor/dashboard"
          : user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/dashboard",
    };

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Login successful"));
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to login")
      );
  }
};


const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json(new ApiResponse(200, {}, "Logged Out Successfully"));
  } catch (error) {
    console.error("Logout Error:", err.message);
    res.status(500).json(new ApiError(500, "Failed to logout"));
  }
};

const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Google token is required" });
  }

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    // If not, create user
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: "", // Google users have no password
          role: "LEARNER",
        },
      });
    }

    // Generate JWT and set cookie
    const jwtToken = generateToken({ id: user.id, role: user.role });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    return res.status(401).json({ message: "Invalid or expired Google token" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profileUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    if (isNaN(userId)) {
      throw new ApiError(401, "User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileUrl: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User details fetched successfully"));
  } catch (error) {
    console.error("Get Current User Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to fetch user details")
      );
  }
};

export { signup, verifyOtp, login, logout, googleAuth, getMe,getCurrentUser };
