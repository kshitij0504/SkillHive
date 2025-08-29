import { ApiError } from "./ApiError.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken"
export const generateRandomPassword = (length = 12) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each category
  password += charset.charAt(Math.floor(Math.random() * 26)); // Uppercase
  password += charset.charAt(26 + Math.floor(Math.random() * 26)); // Lowercase
  password += charset.charAt(52 + Math.floor(Math.random() * 10)); // Number
  password += charset.charAt(62 + Math.floor(Math.random() * 8)); // Special char

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json(new ApiError(403, "Unautorized request"));
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user.role !== "STUDENT") {
    return res.status(403).json(new ApiError(403, "Unautorized request"));
  }
  next();
};

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT, 
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const sendOTPEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"SkillHive" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: "🔐 Your SkillHive OTP for Account Verification",
      html: `
        <div style="background-color: #f4f4f7; padding: 30px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
            
            <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Skill<span style="color: #f59e0b;">Hive</span></h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e3a8a;">Verify Your Account</h2>
              <p style="font-size: 16px; color: #333;">Thanks for joining SkillHive! Use the OTP below to complete your sign-up:</p>
              
              <div style="margin: 30px 0; text-align: center;">
                <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #f59e0b; letter-spacing: 2px;">${otp}</span>
              </div>
              
              <p style="font-size: 14px; color: #666;">This OTP is valid for the next <strong>10 minutes</strong>.</p>
              <p style="font-size: 14px; color: #666;">If you didn’t request this, please ignore this email.</p>
              
              <p style="margin-top: 40px; font-size: 14px; color: #999;">— The SkillHive Team</p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} SkillHive. All rights reserved.
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending OTP email to ${to}:`, error);
    throw new Error("Failed to send OTP email");
  }
};

export { sendOTPEmail };
