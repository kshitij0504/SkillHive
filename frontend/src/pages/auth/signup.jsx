import { Award, BookOpen, Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Authentication from "../../components/Animations/Authentication.json";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleAccount, setGoogleAccount] = useState(null);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000";

  // Load previous Google account from localStorage
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
      await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });
      toast.success("Sign up successful! Please verify your email.");
      navigate("/verify", { state: { email,password, isNewAccount: true } });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : "Sign up failed. Please try again.");
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
      const { user, isNewAccount } = res.data;
      // Store Google account details
      const accountInfo = { email: user.email, name: user.name };
      localStorage.setItem("lastGoogleAccount", JSON.stringify(accountInfo));
      setGoogleAccount(accountInfo);
      toast.success("Google sign up successful!");
      if (isNewAccount) {
        navigate("/verify", { state: { email: user.email, isNewAccount: true } });
      } else {
        navigate("/dashboard", { state: { email: user.email } });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : "Google sign up failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign up failed. Please try again.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-50 to-amber-100 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="mb-8">
            <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-medium inline-block">
              Join SkillHive Today
            </span>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Become part of our vibrant learning community
            </h2>
            <p className="mt-3 text-gray-600">
              Create and take courses from peers who share their expertise
            </p>
          </div>

          <div className="w-full">
            <Lottie animationData={Authentication} loop={true} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <BookOpen size={18} className="text-amber-600 mr-2" />
                <h3 className="font-medium text-gray-900">Learn from peers</h3>
              </div>
              <p className="text-sm text-gray-600">
                Access bite-sized courses created by community experts
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <Award size={18} className="text-amber-600 mr-2" />
                <h3 className="font-medium text-gray-900">Share expertise</h3>
              </div>
              <p className="text-sm text-gray-600">
                Create courses and build your teaching portfolio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
            <p className="mt-2 text-gray-600">
              Join SkillHive to start your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  placeholder="Min. 8 characters"
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
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-600"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-amber-600 hover:text-amber-500"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-amber-600 hover:text-amber-500"
                >
                  Privacy Policy
                </a>
              </label>
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
                  Signing up...
                </span>
              ) : (
                "Create account"
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
                  Or sign up with
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
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;