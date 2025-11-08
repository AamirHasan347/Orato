"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../supabase-provider";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) setError(error.message);
    else router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[#EEEEEE]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap");

        * {
          font-family: "Space Grotesk", sans-serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .input-focused {
          transform: scale(1.02);
          transition: transform 0.2s ease-out;
        }

        .placeholder-fade-out {
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.3s ease-out;
        }

        .button-hover:hover {
          transform: translateY(-2px);
        }

        .button-active:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Left Section - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 md:px-12 lg:px-20 xl:px-24 bg-[#EEEEEE] py-8 sm:py-10">
        <div className="w-full max-w-xl animate-fade-in-up">
          {/* Logo placeholder */}
          <div className="mb-8 sm:mb-10 md:mb-14">
            {/* Add your logo image here:
            <img src="/path-to-your-logo.png" alt="Logo" className="h-10 sm:h-12" />
            */}
          </div>

          {/* Welcome heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 text-gray-900 leading-tight">
            Welcome Back!
          </h1>
          <p className="text-gray-700 mb-10 sm:mb-12 md:mb-16 text-lg sm:text-xl md:text-2xl leading-relaxed">
            With <span className="text-[#EA5455] font-semibold">Orato</span>{" "}
            Become Fluent and
            <br />
            Confident in English
          </p>

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-5 sm:gap-6 md:gap-7"
          >
            {/* Email Input */}
            <div
              className={`relative transition-all duration-200 ${
                emailFocused ? "input-focused" : ""
              }`}
            >
              <div className="absolute left-5 sm:left-6 md:left-7 top-1/2 transform -translate-y-1/2 text-white z-10">
                <span className="text-xl sm:text-2xl md:text-2xl font-semibold">
                  Aa
                </span>
                {/* Or use an icon:
                <img src="/path-to-email-icon.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7" />
                */}
              </div>
              <input
                type="email"
                placeholder={emailFocused || email ? "" : "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                className="w-full pl-16 sm:pl-20 md:pl-24 pr-5 sm:pr-6 md:pr-7 py-4 sm:py-5 md:py-6 rounded-full bg-[#0088FF] text-white placeholder-[#62A1FF] focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:ring-opacity-50 text-lg sm:text-xl md:text-2xl transition-all duration-200 border border-black"
                style={{
                  boxShadow: emailFocused
                    ? "0 4px 12px rgba(0, 136, 255, 0.3)"
                    : "none",
                }}
              />
              {!emailFocused && !email && (
                <div className="absolute left-16 sm:left-20 md:left-24 top-1/2 transform -translate-y-1/2 text-[#62A1FF] text-lg sm:text-xl md:text-2xl pointer-events-none transition-all duration-300">
                  Email
                </div>
              )}
            </div>

            {/* Password Input */}
            <div
              className={`relative transition-all duration-200 ${
                passwordFocused ? "input-focused" : ""
              }`}
            >
              <div className="absolute left-5 sm:left-6 md:left-7 top-1/2 transform -translate-y-1/2 text-white z-10">
                <span className="text-xl sm:text-2xl md:text-2xl">🔒</span>
                {/* Or use an icon:
                <img src="/path-to-lock-icon.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7" />
                */}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={passwordFocused || password ? "" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                className="w-full pl-16 sm:pl-20 md:pl-24 pr-16 sm:pr-20 md:pr-24 py-4 sm:py-5 md:py-6 rounded-full bg-[#FDB241] text-white placeholder-[#FFC36A] focus:outline-none focus:ring-2 focus:ring-[#FDB241] focus:ring-opacity-50 text-lg sm:text-xl md:text-2xl transition-all duration-200 border border-black"
                style={{
                  boxShadow: passwordFocused
                    ? "0 4px 12px rgba(253, 178, 65, 0.3)"
                    : "none",
                }}
              />
              {!passwordFocused && !password && (
                <div className="absolute left-16 sm:left-20 md:left-24 top-1/2 transform -translate-y-1/2 text-[#FFC36A] text-lg sm:text-xl md:text-2xl pointer-events-none transition-all duration-300">
                  Password
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 sm:right-6 md:right-7 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110 z-10 text-xl sm:text-2xl"
              >
                {/* Add your eye icon here:
                <img src={showPassword ? "/path-to-eye-off.png" : "/path-to-eye.png"} alt="Toggle" className="w-6 h-6 sm:w-7 sm:h-7" />
                */}
                👁️
              </button>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-sm sm:text-base md:text-lg">
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded accent-gray-800 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                />
                <span className="text-gray-700 transition-colors duration-200 group-hover:text-gray-900">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 sm:py-5 md:py-6 rounded-full bg-[#EA5455] text-white text-lg sm:text-xl md:text-2xl font-semibold transition-all duration-200 mt-4 sm:mt-5 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed button-hover button-active"
              style={{
                boxShadow: "4px 6px 0px 0.8px rgba(0, 0, 0, 1)",
              }}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {error && (
            <p className="text-[#EA5455] mt-5 sm:mt-6 text-center text-sm sm:text-base md:text-lg animate-scale-in">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Right Section - Promotional Content */}
      <div className="hidden md:flex flex-1 bg-[#87B6FC] items-center justify-center p-8 lg:p-12 rounded-3xl m-6 lg:m-8 animate-fade-in-up">
        <div className="text-center max-w-lg">
          {/* Illustration placeholder */}
          <div className="mb-12 animate-float">
            {/* Add your illustration/image here:
            <img src="/path-to-illustration.png" alt="Orato" className="w-full max-w-md mx-auto" />
            */}
          </div>

          {/* Carousel dots */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-white opacity-50 transition-all duration-300 hover:opacity-75"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-50 transition-all duration-300 hover:opacity-75"></div>
            <div className="w-8 h-2 rounded-full bg-white transition-all duration-300"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-50 transition-all duration-300 hover:opacity-75"></div>
          </div>

          {/* Promotional text */}
          <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 leading-tight">
            Make English Fun and Exciting
            <br />
            with Orato
          </h2>
        </div>
      </div>
    </div>
  );
}
