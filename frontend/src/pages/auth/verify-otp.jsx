import { ArrowLeft, CheckCircle, Shield } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from location.state
  const email = location.state?.email;
  const password = location.state.password;

  // Focus reference for OTP inputs
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  const API_URL = "http://localhost:5000";

  // Redirect to login if email is missing
  useEffect(() => {
    if (!email) {
      toast.error("Email is required. Please start the verification process again.");
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value.match(/^[0-9]$/) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value !== "" && index < 5) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.match(/^[0-9]{6}$/)) {
      const otpArray = pastedData.split("");
      setOtp(otpArray);
      inputRefs[5].current.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // Verify OTP
      const otpCode = otp.join("");
      await axios.post(`${API_URL}/auth/verify`, {
        email,
        otp: otpCode,
      });

      // Call login API
      const loginResponse = await axios.post(
        `${API_URL}/auth/login`,
        { email,password },
        { withCredentials: true }
      );

      setIsVerifying(false);
      setIsVerified(true);
      toast.success("OTP verified successfully!");

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard", { state: { email: loginResponse.data.user.email } });
      }, 1500);
    } catch (err) {
      setIsVerifying(false);
      const errorMessage =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : "OTP verification failed. Please try again.");
      toast.error(errorMessage);
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post(`${API_URL}/auth/resend-otp`, { email });
      toast.success("OTP resent successfully!");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : "Failed to resend OTP. Please try again.");
      toast.error(errorMessage);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          {!isVerified ? (
            <>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back</span>
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Verification code
                </h1>
                <p className="mt-2 text-gray-600">
                  We've sent a 6-digit code to {email || "your email"}. Please enter it below
                  to verify your account.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Enter verification code
                  </label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isOtpComplete || isVerifying || !email}
                  className={`w-full rounded-lg py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isOtpComplete && !isVerifying && email
                      ? "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } transition-colors relative`}
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Verifying...
                    </span>
                  ) : (
                    "Verify"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive a code?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="font-medium text-amber-600 hover:text-amber-500"
                    disabled={isVerifying}
                  >
                    Resend code
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Verification successful!
              </h2>
              <p className="mt-2 text-gray-600">
                Redirecting you to your dashboard...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right section - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-50 to-amber-100 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="mb-8">
            <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-medium inline-block">
              Account Verification
            </span>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              One step away from accessing SkillHive
            </h2>
            <p className="mt-3 text-gray-600">
              Enter the verification code to complete your secure login
            </p>
          </div>

          <div className="w-full">
            {/* Replace with your animation */}
            <div className="w-64 h-64 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 font-bold">OTP Animation</span>
            </div>
          </div>

          <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-1 bg-amber-100 rounded-full">
                <Shield size={16} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Security First</h3>
                <p className="text-sm text-gray-600">
                  Your security is our priority. This extra verification step
                  helps protect your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;