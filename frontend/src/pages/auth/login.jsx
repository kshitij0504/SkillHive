import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Authentication from "../../components/Animations/Authentication.json";
import Lottie from "lottie-react";
import axios from "axios";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleAccount, setGoogleAccount] = useState(null);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const storedAccount = localStorage.getItem("lastGoogleAccount");
    if (storedAccount) {
      setGoogleAccount(JSON.parse(storedAccount));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      toast.success("Login successful!");
      const { redirectTo } = res.data.data;
      navigate(redirectTo, { state: { email } });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : "Login failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      const { user, isNewAccount, redirectTo } = res.data.data;
      const accountInfo = { email: user.email, name: user.name };
      localStorage.setItem("lastGoogleAccount", JSON.stringify(accountInfo));
      setGoogleAccount(accountInfo);
      toast.success("Google login successful!");
      if (isNewAccount) {
        navigate("/verify", { state: { email: user.email, isNewAccount: true } });
      } else {
        navigate(redirectTo, { state: { email: user.email } });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : "Google login failed. Invalid or expired token.");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-600">
              Login to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-amber-600 hover:text-amber-500"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-amber-600 text-white rounded-lg py-3 px-4 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div
                className={`w-full border border-amber-300 bg-amber-100 rounded-lg ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  text="continue_with"
                  logo_alignment="left"
                  width="384"
                  disabled={isLoading}
                  theme="outline"
                  prompt="select_account"
                  className="w-full !bg-transparent !border-none !shadow-none !text-amber-800 !font-medium !py-3 !px-4"
                />
              </div>
              {googleAccount && (
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Last used: {googleAccount.email}
                </p>
              )}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-50 to-amber-100 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="mb-8">
            <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-medium inline-block">
              SkillHive Login
            </span>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Connect with a community of learners and creators
            </h2>
            <p className="mt-3 text-gray-600">
              Access your courses, track your progress, and continue building
              your skills
            </p>
          </div>

          <div className="w-full">
            <Lottie animationData={Authentication} loop={true} />
          </div>

          <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://via.placeholder.com/40"
                  alt="Testimonial"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  "SkillHive has transformed the way I learn new skills. The
                  community aspect makes all the difference!"
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  Alex Chen, UX Designer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;