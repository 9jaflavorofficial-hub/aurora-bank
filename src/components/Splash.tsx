/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#051126] text-white p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial-gradient from-[#0A63FF]/20 via-transparent to-transparent opacity-60 rounded-full blur-[120px] pointer-events-none" />

      {/* Animated Rings */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          className="absolute w-36 h-36 rounded-full border border-dashed border-[#D8A63D]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-28 h-28 rounded-full border border-[#0A63FF]/40"
          animate={{ scale: [1, 1.15, 1], rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Animated Logo Icon */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-tr from-[#071C3F] to-[#0A63FF] rounded-2xl flex items-center justify-center shadow-2xl border border-[#D8A63D]/30 relative z-10"
          initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <ShieldCheck className="w-10 h-10 text-[#D8A63D]" />
        </motion.div>
      </div>

      {/* App Branding */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h1 className="text-3xl font-sans font-bold tracking-widest text-white mb-2 uppercase">
          Aurora <span className="text-[#D8A63D]">Bank</span>
        </h1>
        <p className="text-sm font-mono tracking-wider text-gray-300 opacity-85">
          Smart Banking Beyond Limits
        </p>
      </motion.div>

      {/* Shimmering Loader */}
      <div className="mt-16 w-48 h-[3px] bg-[#051126]/60 rounded-full border border-white/10 overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0A63FF] to-[#D8A63D]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.8, ease: "easeInOut" }}
        />
      </div>

      {/* Safety Badge */}
      <motion.div
        className="absolute bottom-10 flex items-center gap-2 opacity-65 text-xs text-gray-400 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ delay: 1.5 }}
      >
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        <span>Secure 256-Bit Encrypted Environment</span>
      </motion.div>
    </div>
  );
}
