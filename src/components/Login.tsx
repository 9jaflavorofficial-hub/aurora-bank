import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  User,
  Lock,
  ChevronLeft,
  ScanFace,
  Fingerprint,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Info
} from "lucide-react";
import { AuroraDB } from "../db/mockDb";

interface LoginProps {
  onLoginSuccess: (userId: string) => void;
  onNavigate: (page: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Biometric scanning simulation states
  const [biometricScanning, setBiometricScanning] = useState<"FaceID" | "Fingerprint" | null>(null);
  
  // Custom in-app SMS notification banner state
  const [smsBanner, setSmsBanner] = useState<{ phone: string; code: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username) {
      setError("Username cannot be empty.");
      return;
    }

    if (username.trim().length < 6) {
      setError("Username must be at least 6 characters.");
      return;
    }

    if (!password) {
      setError("Password cannot be empty.");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        setError("This connection was intercepted by the preview security gateway. Please open the app in a New Tab (top-right of the screen) to authorize access.");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid Username or Password");
        return;
      }

      // Store JWT token
      sessionStorage.setItem("aurora_token", data.token);

      // Log login success in security logs
      const state = AuroraDB.getState();
      const user = state.users.find(u => u.id === data.userId);
      if (user) {
        const now = new Date().toISOString();
        const log = {
          id: `LOG-${Math.random()}`,
          userId: user.id,
          event: "Successful Login",
          device: "Chrome / Web Application",
          location: "New York, USA",
          date: now,
          status: "Success" as any
        };
        state.securityLogs.unshift(log);
        await AuroraDB.saveSecurityLog(log);
      }

      onLoginSuccess(data.userId);
    } catch (err: any) {
      setError(`Service is currently unavailable. Please try again later. (Error: ${err.message || err})`);
    }
  };

  const handleBiometricLogin = (type: "FaceID" | "Fingerprint") => {
    if (!username.trim()) {
      setError(`To log in via ${type === "FaceID" ? "Face ID" : "Touch ID"}, please select an account first.`);
      return;
    }

    const state = AuroraDB.getState();
    const user = state.users.find(
      u => (u.username || "").toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setError("User profile not found. Biometric authentication requires a valid registered username.");
      return;
    }

    if (user.status === "Locked") {
      setError("This account is temporarily locked. Biometric access is disabled.");
      return;
    }

    if (user.status === "Suspended") {
      setError("This account is suspended. Biometric access is disabled.");
      return;
    }

    setError("");
    setBiometricScanning(type);

    // Simulate luxury biometric scan sequence of 1.5s
    setTimeout(() => {
      setBiometricScanning(null);
      
      // Log biometric access success
      const log = {
        id: `LOG-${Math.random()}`,
        userId: user.id,
        event: `Biometric Access (${type})`,
        device: "Sensors - Web Engine",
        location: "New York, USA",
        date: new Date().toISOString(),
        status: "Success" as any
      };
      state.securityLogs.push(log);
      AuroraDB.saveSecurityLog(log);

      onLoginSuccess(user.id);
    }, 1500);
  };

  const handleOtpLogin = () => {
    if (!username) {
      setError("Please enter your username / Customer ID first to trigger SMS verification.");
      return;
    }
    const state = AuroraDB.getState();
    const user = state.users.find(u => u.username === username.trim().toLowerCase());
    if (!user) {
      setError("Customer ID / Username not found.");
      return;
    }

    if (!otpSent) {
      setError("");
      setOtpSent(true);
      
      // Slide down beautiful SMS modal banner
      setSmsBanner({ phone: user.phone, code: "9082" });
      
      // Automatically hide banner after 8 seconds
      setTimeout(() => {
        setSmsBanner(null);
      }, 8000);
    } else {
      if (otpCode === "9082") {
        setError("");
        onLoginSuccess(user.id);
      } else {
        setError("Incorrect OTP verification code.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#051126] text-white px-6 py-6 flex flex-col justify-between max-w-lg mx-auto font-sans relative overflow-hidden">
      
      {/* Sliding SMS OTP Notification Banner */}
      <AnimatePresence>
        {smsBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 left-4 right-4 bg-black/90 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-left cursor-pointer"
            onClick={() => {
              setOtpCode("9082");
              setSmsBanner(null);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 text-blue-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-gray-400">AURORA BANK SECURE SMS</span>
                  <span className="text-[9px] font-mono text-gray-500">now</span>
                </div>
                <p className="text-xs text-white/95 mt-1 font-sans">
                  Secure OTP code for <span className="text-[#D8A63D] font-semibold">{smsBanner.phone}</span> is:{" "}
                  <span className="font-mono bg-white/15 px-1.5 py-0.5 rounded text-[#D8A63D] font-bold text-sm tracking-wider">9082</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Tap this banner to autofill the verification code.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Scanning Overlay */}
      <AnimatePresence>
        {biometricScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#051126]/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center"
          >
            <div className="relative flex items-center justify-center mb-6">
              {/* Spinning Scanner Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-dashed border-[#2563EB]/40 absolute"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-28 h-28 rounded-full border-2 border-dotted border-[#D8A63D]/30 absolute"
              />
              
              <div className="w-18 h-18 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 z-10">
                {biometricScanning === "FaceID" ? (
                  <ScanFace className="w-9 h-9 text-[#2563EB]" />
                ) : (
                  <Fingerprint className="w-9 h-9 text-[#2563EB]" />
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white mb-1.5">
              Authenticating via {biometricScanning === "FaceID" ? "Face ID" : "Touch ID"}
            </h3>
            <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
              Verify your physical identity coordinates against secure hardware keys...
            </p>
            
            <div className="mt-8 flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">AURA_SECURE_ENCLAVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate("landing")}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#2563EB] to-[#D8A63D] rounded-lg flex items-center justify-center border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#051126]" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">Aurora</span>
        </div>

        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-xs mt-1.5">Please sign in to access your secure portal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Username / Customer ID</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm transition-colors text-white"
                id="login-username"
              />
            </div>
          </div>

          <div className="text-left">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono text-gray-400 uppercase">Password</label>
              <button
                type="button"
                onClick={() => alert(`Simulated Reset Link dispatched for customer: ${username || "Anonymous"}`)}
                className="text-xs text-[#2563EB] font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm transition-colors text-white"
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3.5 text-gray-400"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {otpSent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-1.5 text-left"
            >
              <label className="block text-xs font-mono text-gray-400 uppercase">SMS Verification Code</label>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-center font-mono tracking-widest text-white"
              />
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0"
              />
              <span className="text-xs text-gray-300">Remember Me</span>
            </label>
          </div>

          {error && (
            <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3.5 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-white shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
            id="login-submit-btn"
          >
            <span>Log In</span>
          </motion.button>
        </form>

        {/* Alternatives Split */}
        <div className="my-6 flex items-center justify-center gap-3">
          <div className="h-[1px] bg-white/5 flex-1" />
          <span className="text-[10px] text-gray-500 font-mono">OR LOG IN SECURELY WITH</span>
          <div className="h-[1px] bg-white/5 flex-1" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleBiometricLogin("FaceID")}
            type="button"
            className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer animate-pulse"
          >
            <ScanFace className="w-5 h-5 text-[#2563EB]" />
            <span className="text-[10px] font-mono tracking-wide text-gray-300">Face ID</span>
          </button>

          <button
            onClick={() => handleBiometricLogin("Fingerprint")}
            type="button"
            className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            <Fingerprint className="w-5 h-5 text-[#2563EB]" />
            <span className="text-[10px] font-mono tracking-wide text-gray-300">Touch ID</span>
          </button>

          <button
            onClick={handleOtpLogin}
            type="button"
            className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-[#2563EB]" />
            <span className="text-[10px] font-mono tracking-wide text-gray-300">SMS OTP</span>
          </button>
        </div>
      </div>

      {/* Register Redirect Link */}
      <div className="text-center mt-6">
        <span className="text-xs text-gray-400">Don't have an account? </span>
        <button
          onClick={() => onNavigate("register")}
          className="text-xs text-[#2563EB] font-bold hover:underline"
        >
          Register Now
        </button>
      </div>

    </div>
  );
}
