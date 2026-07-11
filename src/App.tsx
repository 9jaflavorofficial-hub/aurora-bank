/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  Home,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Grid,
  Bell,
  User,
  Shield,
  MapPin,
  Settings as SettingsIcon,
  MessageSquare,
  HelpCircle,
  Phone,
  LogOut,
  ChevronRight,
  Sparkles,
  FileText,
  DollarSign,
  TrendingUp,
  History
} from "lucide-react";

import Splash from "./components/Splash";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Views from "./components/Views";
import AdminPanel from "./components/AdminPanel";
import StatusBar from "./components/StatusBar";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSplash, setShowSplash] = useState(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    const isSpecialPath = path.includes("/admin") ||
                          path.includes("/login") ||
                          path.includes("/register") ||
                          path.includes("/dashboard");
    return !isSpecialPath;
  });

  const [activeView, setActiveView] = useState<string>("home");
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem("aurora_remember_user_id") || "";
  });
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  const handleLoginSuccess = (userId: string, remember: boolean = false) => {
    setCurrentUserId(userId);
    if (remember) {
      localStorage.setItem("aurora_remember_user_id", userId);
    } else {
      localStorage.removeItem("aurora_remember_user_id");
    }
    navigate("/dashboard");
    setActiveView("home");
  };

  const handleLogout = () => {
    setCurrentUserId("");
    localStorage.removeItem("aurora_remember_user_id");
    setIsNavDrawerOpen(false);
    navigate("/");
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#051126] flex items-center justify-center p-0 sm:p-4">
        {/* Mobile Frame Container Mockup */}
        <div className="w-full max-w-lg min-h-screen sm:min-h-[812px] sm:max-h-[850px] bg-[#051126] sm:rounded-[36px] sm:border-8 sm:border-[#071C3F] shadow-2xl overflow-hidden flex flex-col relative">
          <StatusBar />
          <div className="flex-1 flex flex-col h-full">
            <Splash onComplete={() => setShowSplash(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051126] flex items-center justify-center p-0 sm:p-4">
      {/* Mobile Frame Container Mockup */}
      <div className="w-full max-w-lg min-h-screen sm:min-h-[812px] sm:max-h-[850px] bg-[#051126] sm:rounded-[36px] sm:border-8 sm:border-[#071C3F] shadow-2xl overflow-hidden flex flex-col relative">
        <StatusBar />
        
        <Routes>
          {/* Main User Routes */}
          <Route 
            path="/" 
            element={currentUserId ? <Navigate to="/dashboard" replace /> : <Landing onNavigate={(page) => navigate(page === "landing" ? "/" : "/" + page)} />} 
          />
          <Route 
            path="/login" 
            element={currentUserId ? <Navigate to="/dashboard" replace /> : <Login onNavigate={(page) => navigate(page === "landing" ? "/" : "/" + page)} onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={currentUserId ? <Navigate to="/dashboard" replace /> : <Register onNavigate={(page) => navigate(page === "landing" ? "/" : "/" + page)} />} 
          />
          <Route 
            path="/dashboard" 
            element={currentUserId ? (
              <div className="flex-1 flex flex-col h-full bg-[#051126]">
                {/* Premium Dashboard Header */}
                <header className="sticky top-0 bg-[#051126]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center z-30">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsNavDrawerOpen(true)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-black tracking-widest text-white flex items-center gap-1.5 ml-1">
                      AURORA <span className="text-[#D8A63D] font-medium text-[10px] tracking-normal px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">PLATINUM</span>
                    </span>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-[#D8A63D] bg-[#D8A63D]/10 border border-[#D8A63D]/30 px-2.5 py-1 rounded">
                    SECURE PORT
                  </div>
                </header>

                {/* Main Scrolling View panels */}
                <Views
                  currentUserId={currentUserId}
                  onLogout={handleLogout}
                  activeView={activeView}
                  setActiveView={setActiveView}
                />

                {/* NAVIGATION DRAWER */}
                <AnimatePresence>
                  {isNavDrawerOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsNavDrawerOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50"
                      />

                      {/* Sliding Drawer Menu */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 220 }}
                        className="absolute inset-y-0 left-0 w-[280px] bg-[#071C3F] border-r border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between"
                      >
                        <div>
                          {/* Drawer Header */}
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-black tracking-widest text-white">AURORA</span>
                            <button
                              onClick={() => setIsNavDrawerOpen(false)}
                              className="p-1 rounded bg-white/5 text-gray-400"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Navigation list */}
                          <div className="space-y-1.5 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
                            {[
                              { id: "home", label: "Dashboard", icon: Home },
                              { id: "accounts", label: "Aurora Accounts", icon: Wallet },
                              { id: "transfer", label: "Direct Transfers", icon: ArrowLeftRight },
                              { id: "pay-bills", label: "Utility Pay Bills", icon: FileText },
                              { id: "cards", label: "Premium Cards", icon: CreditCard },
                              { id: "history", label: "Statement History", icon: History },
                              { id: "loans", label: "Loans & Mortgages", icon: DollarSign },
                              { id: "investments", label: "Equity Investments", icon: TrendingUp },
                              { id: "profile", label: "Personal Profile", icon: User },
                              { id: "security", label: "Security Center", icon: Shield },
                              { id: "locator", label: "Branch Locator", icon: MapPin },
                              { id: "support", label: "Support Assistance", icon: MessageSquare },
                              { id: "faq", label: "Security FAQ", icon: HelpCircle },
                              { id: "contact", label: "Contact HQ", icon: Phone }
                            ].map(item => {
                              const Icon = item.icon;
                              const isActive = activeView === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setActiveView(item.id);
                                    setIsNavDrawerOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive ? "bg-[#0A63FF] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
                                >
                                  <Icon className="w-4.5 h-4.5" />
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Terminate session */}
                        <button
                          onClick={handleLogout}
                          className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-4"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out Session</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )} 
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/" element={<AdminPanel />} />
          <Route path="/admin/index.html" element={<AdminPanel />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          <Route path="/admin/dashboard/" element={<AdminPanel />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
