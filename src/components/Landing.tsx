/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Zap,
  Headphones,
  Globe,
  Menu,
  X,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  HelpCircle,
  Phone,
  FileText,
  Lock,
  Settings as SettingsIcon
} from "lucide-react";

interface LandingProps {
  onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const [showDrawer, setShowDrawer] = useState(false);

  // Statistics data
  const stats = [
    { value: "20M+", label: "Happy Customers" },
    { value: "120+", label: "Countries" },
    { value: "5K+", label: "Branches" },
    { value: "99.99%", label: "System Uptime" }
  ];

  // Features data
  const features = [
    {
      id: "secure",
      icon: Shield,
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10",
      border: "border-[#2563EB]/30",
      title: "Secure Banking",
      description: "Enterprise-grade digital safety safeguards all transaction corridors."
    },
    {
      id: "fast",
      icon: Zap,
      color: "text-[#D8A63D]",
      bg: "bg-[#D8A63D]/10",
      border: "border-[#D8A63D]/30",
      title: "Fast Transfers",
      description: "Lightning fast speed execution delivers capital anywhere in seconds."
    },
    {
      id: "support",
      icon: Headphones,
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10",
      border: "border-[#2563EB]/30",
      title: "24/7 Support",
      description: "Live luxury concierge service available on-demand every hour."
    },
    {
      id: "global",
      icon: Globe,
      color: "text-[#D8A63D]",
      bg: "bg-[#D8A63D]/10",
      border: "border-[#D8A63D]/30",
      title: "Global Access",
      description: "Multi-currency digital vault is borderless and globally responsive."
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#071B34] text-white font-sans overflow-x-hidden relative">
      
      {/* 1. Full-screen night skyline with luxury skyscrapers. 
          Tallest building appears on the right side, illuminated with warm city lights. 
          Slow pan animation. */}
      <div className="absolute inset-0 w-full h-[640px] overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, -15, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 w-[110%] h-full bg-cover bg-right-bottom opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200')`, // Perfect night city skyline with skyscrapers
          }}
        />
        {/* Dark navy gradient overlay to keep text highly readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071B34]/65 via-[#071B34]/90 to-[#071B34]" />
      </div>

      {/* 2. Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-white/5 backdrop-blur-md bg-[#071B34]/60">
        {/* Logo Left */}
        <div className="flex items-center gap-2">
          {/* Gold triangular logo icon */}
          <div className="w-9 h-9 bg-gradient-to-tr from-[#D8A63D] via-[#F3C052] to-[#B58B2E] rounded-lg flex items-center justify-center shadow-lg border border-[#D8A63D]/30">
            {/* Elegant triangular delta sign */}
            <svg className="w-5 h-5 text-[#071B34]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4l7.5 14h-15L12 6z" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-black tracking-[0.25em] text-[#D8A63D]">AURORA</span>
            <span className="text-[10px] font-bold tracking-[0.1em] text-white/70">BANK</span>
          </div>
        </div>

        {/* Hamburger Menu (☰) Right */}
        <button 
          onClick={() => setShowDrawer(true)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          id="hamburger-menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* 3. Hero Content & Main Features Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-10 pb-20 max-w-lg mx-auto">
        
        {/* Hero Section */}
        <div className="text-left mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight"
          >
            Banking Beyond Limits
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <p className="text-[#D8A63D] font-mono text-xs font-semibold tracking-wider uppercase">
              “Smart. Secure. Seamless.”
            </p>
            <p className="text-white/75 text-sm leading-relaxed max-w-md">
              Experience next-generation banking with simplicity, innovation, and enterprise-grade security.
            </p>
          </motion.div>
        </div>

        {/* 4. Primary Buttons (Side-by-side) */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {/* Button 1: Open an Account */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("register")}
            className="py-4 px-3 rounded-[20px] bg-[#2563EB] font-bold text-sm text-white shadow-lg shadow-[#2563EB]/20 border border-white/10 hover:brightness-110 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
            style={{
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.35)"
            }}
            id="btn-open-account"
          >
            <span>Open Account</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Button 2: Login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("login")}
            className="py-4 px-3 rounded-[20px] bg-transparent border-2 border-white/20 hover:border-white/40 hover:bg-white/5 font-bold text-sm text-white transition-all text-center cursor-pointer"
            id="btn-login-welcome"
          >
            Login
          </motion.button>
        </div>

        {/* 5. Statistics (4 evenly spaced counters in 2x2 luxury grid or horizontal block) */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[22px] p-5 backdrop-blur-md shadow-2xl mb-12">
          <p className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase text-center mb-4">Aurora Global Operations</p>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            {stats.map((st, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-xl font-extrabold text-white tracking-tight">{st.value}</div>
                <div className="text-[11px] text-white/50 mt-1">{st.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 6. Banking Features (Circular icons, title, description, with subtle bounce) */}
        <div className="space-y-6 mb-12">
          <h3 className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase text-center mb-6">
            Elite Institutional Standards
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {features.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={feat.id}
                  className="flex items-start gap-4 p-4 rounded-[20px] bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.04]"
                >
                  {/* Circular icon */}
                  <div className={`w-12 h-12 rounded-full ${feat.bg} ${feat.border} border flex items-center justify-center shrink-0`}>
                    <IconComp className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{feat.description}</p>
                    {feat.id === "support" && (
                      <button
                        onClick={() => {
                          const isLocked = localStorage.getItem("aurora_hidden_link_locked") === "true";
                          if (!isLocked) {
                            onNavigate("admin");
                          }
                        }}
                        className="block mt-1 text-[10px] text-white/30 hover:text-[#D8A63D]/40 transition-colors bg-transparent border-0 p-0 font-normal focus:outline-none cursor-pointer hover:underline"
                        style={{ background: "none", border: "none" }}
                        id="btn-hidden-details"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Footer Display & App Stores */}
        <div className="text-center pt-8 border-t border-white/5 space-y-5">
          <p className="text-xs text-white/50 font-medium">
            “Bank anywhere with Aurora Bank Mobile.”
          </p>
          
          <div className="flex justify-center gap-3">
            {/* Apple App Store */}
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 px-4 py-2 bg-black/45 hover:bg-black/70 border border-white/10 rounded-xl transition-all"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.98.12.02.24.03.36.03.96 0 2.11-.64 2.62-1.45z"/>
              </svg>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-wider text-white/40 leading-none">Download on the</p>
                <p className="text-[10px] font-bold text-white leading-tight">App Store</p>
              </div>
            </a>

            {/* Google Play */}
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 px-4 py-2 bg-black/45 hover:bg-black/70 border border-white/10 rounded-xl transition-all"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3.14a1.86 1.86 0 0 0-.44 1.24v15.24c0 .49.16.92.44 1.24l9.53-9.53L5 3.14zm11.23 6.13l-3.21-1.84L3.48 17.5l9.54-9.54 3.21 1.31zm3.25 1.86l-2.73-1.56-2.21 2.21 2.21 2.21 2.73-1.56a1.27 1.27 0 0 0 0-1.3zM5.3 3.32l9.13 9.13 2.21-2.21L5.3 3.32z"/>
              </svg>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-wider text-white/40 leading-none">Get it on</p>
                <p className="text-[10px] font-bold text-white leading-tight">Google Play</p>
              </div>
            </a>
          </div>
        </div>

      </div>

      {/* Hamburger Drawer Overlay */}
      <AnimatePresence>
        {showDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dimmed backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs" 
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-[#071B34] border-l border-white/10 p-6 flex flex-col justify-between relative z-10 shadow-2xl"
            >
              {/* Top Row */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-[0.15em] text-xs text-[#D8A63D]">AURORA HUB</span>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Specific menu options listed in spec */}
                <div className="flex flex-col gap-1 text-left">
                  {[
                    { name: "About Us", icon: Info },
                    { name: "Products", icon: Layers },
                    { name: "Branches", icon: MapPin },
                    { name: "Support", icon: HelpCircle },
                    { name: "Contact", icon: Phone },
                    { name: "Privacy Policy", icon: FileText },
                    { name: "Terms & Conditions", icon: Lock },
                    { name: "Settings", icon: SettingsIcon }
                  ].map((item, index) => {
                    const IconElem = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          alert(`Navigating to ${item.name} details...`);
                          setShowDrawer(false);
                        }}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all text-left"
                      >
                        <IconElem className="w-4 h-4 text-[#D8A63D]" />
                        <span className="text-xs font-semibold">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom footer inside drawer */}
              <div className="pt-6 border-t border-white/5 text-[10px] text-white/40 font-mono text-center space-y-1">
                <div>Aurora Bank Mobile v4.8</div>
                <div>Enterprise Grade Security</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
