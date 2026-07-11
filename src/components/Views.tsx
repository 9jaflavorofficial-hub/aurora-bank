/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home as HomeIcon,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Grid,
  Bell,
  Eye,
  EyeOff,
  Send,
  Download,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  CheckCircle,
  User,
  Shield,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
  DollarSign,
  Briefcase,
  TrendingUp,
  FileText,
  Mail,
  Phone,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Trash2,
  LockKeyhole,
  Building,
  Smartphone,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  FileCheck,
  Key,
  Sliders,
  Globe,
  Star,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Share2,
  Check,
  ShieldAlert,
  BellOff,
  ChevronDown
} from "lucide-react";
import { AuroraDB } from "../db/mockDb";
import { AccountType, CardType, TransactionCategory, CardStatus } from "../types";

// =============================================================
// GLOBAL VIEW CONTAINER
// =============================================================
interface ViewsProps {
  currentUserId: string;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Views({
  currentUserId,
  onLogout,
  activeView,
  setActiveView
}: ViewsProps) {
  // DB States
  const [dbState, setDbState] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Sync DB
  const syncDB = () => {
    const state = AuroraDB.getState();
    setDbState(state);
    const activeUser = state.users.find(u => u.id === currentUserId);
    if (currentUserId) {
      if (!activeUser) {
        onLogout();
        return;
      }
      if (activeUser.status === "Suspended" || activeUser.status === "Locked") {
        onLogout();
        return;
      }
    }
    setUser(activeUser);
  };

  useEffect(() => {
    syncDB();
  }, [currentUserId, activeView]);

  useEffect(() => {
    const handleUpdate = () => {
      syncDB();
    };
    window.addEventListener("aurora_db_updated", handleUpdate);
    return () => {
      window.removeEventListener("aurora_db_updated", handleUpdate);
    };
  }, [currentUserId]);

  if (!user || !dbState) return <div className="p-6 text-center text-white">Loading Digital Account...</div>;

  const accounts = dbState.accounts.filter((a: any) => a.userId === currentUserId);
  const cards = dbState.cards.filter((c: any) => c.userId === currentUserId);
  const transactions = dbState.transactions.filter((t: any) => t.userId === currentUserId);
  const notifications = dbState.notifications.filter((n: any) => n.userId === currentUserId);
  const loans = dbState.loans.filter((l: any) => l.userId === currentUserId);
  const investments = dbState.investments.filter((i: any) => i.userId === currentUserId);
  const tickets = dbState.tickets.filter((t: any) => t.userId === currentUserId);

  const checkingAcc = accounts.find((a: any) => a.type === AccountType.CHECKING) || accounts[0];
  const savingsAcc = accounts.find((a: any) => a.type === AccountType.SAVINGS) || accounts[1];
  const businessAcc = accounts.find((a: any) => a.type === AccountType.BUSINESS);
  const totalBalance = accounts.reduce((sum: number, a: any) => sum + a.balance, 0);

  // Helper to trigger custom system notifications
  const triggerNotification = async (title: string, message: string, category: string) => {
    const newNotif = {
      id: `NOTIF-${Math.random()}`,
      userId: currentUserId,
      title,
      message,
      category: category as any,
      date: new Date().toISOString(),
      isRead: false
    };
    await AuroraDB.saveNotification(newNotif);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#051126] text-white">
      {/* Scrollable View Content wrapper */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeView === "home" && (
          <HomeView
            user={user}
            accounts={accounts}
            checkingAcc={checkingAcc}
            totalBalance={totalBalance}
            transactions={transactions}
            isBalanceHidden={isBalanceHidden}
            setIsBalanceHidden={setIsBalanceHidden}
            setActiveView={setActiveView}
            notifications={notifications}
            triggerNotification={triggerNotification}
            cards={cards}
          />
        )}
        {activeView === "accounts" && (
          <AccountsView
            accounts={accounts}
            triggerNotification={triggerNotification}
            syncDB={syncDB}
          />
        )}
        {activeView === "transfer" && (
          <TransferView
            accounts={accounts}
            beneficiaries={dbState.beneficiaries.filter((b: any) => b.userId === currentUserId)}
            triggerNotification={triggerNotification}
            syncDB={syncDB}
            user={user}
          />
        )}
        {activeView === "pay-bills" && (
          <PayBillsView
            accounts={accounts}
            triggerNotification={triggerNotification}
            syncDB={syncDB}
            user={user}
          />
        )}
        {activeView === "cards" && (
          <CardsView
            cards={cards}
            accounts={accounts}
            triggerNotification={triggerNotification}
            syncDB={syncDB}
            user={user}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "history" && (
          <HistoryView
            transactions={transactions}
            syncDB={syncDB}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "loans" && (
          <LoansView
            loans={loans}
            triggerNotification={triggerNotification}
            syncDB={syncDB}
            user={user}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "investments" && (
          <InvestmentsView
            investments={investments}
            accounts={accounts}
            triggerNotification={triggerNotification}
            syncDB={syncDB}
            user={user}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "profile" && (
          <ProfileView
            user={user}
            syncDB={syncDB}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "security" && (
          <SecurityView
            user={user}
            securityLogs={dbState.securityLogs.filter((l: any) => l.userId === currentUserId)}
            syncDB={syncDB}
            triggerNotification={triggerNotification}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "locator" && (
          <LocatorView
            branches={dbState.branches}
            setActiveView={setActiveView}
            triggerNotification={triggerNotification}
          />
        )}
        {activeView === "notifications" && (
          <NotificationsView
            notifications={notifications}
            syncDB={syncDB}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "settings" && (
          <SettingsView
            onLogout={onLogout}
            setActiveView={setActiveView}
            user={user}
            syncDB={syncDB}
            triggerNotification={triggerNotification}
          />
        )}
        {activeView === "support" && (
          <SupportView
            tickets={tickets}
            syncDB={syncDB}
            user={user}
            setActiveView={setActiveView}
          />
        )}
        {activeView === "faq" && (
          <FAQView
            setActiveView={setActiveView}
          />
        )}
        {activeView === "contact" && (
          <ContactView
            setActiveView={setActiveView}
            triggerNotification={triggerNotification}
          />
        )}
      </div>

      {/* Persistent Glassmorphism Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#051126]/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between items-center z-40">
        {[
          { id: "home", label: "Home", icon: HomeIcon },
          { id: "accounts", label: "Accounts", icon: Wallet },
          { id: "transfer", label: "Transfer", icon: ArrowLeftRight },
          { id: "cards", label: "Cards", icon: CreditCard },
          { id: "more", label: "More", icon: Grid }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = tab.id === "more"
            ? ["loans", "investments", "profile", "security", "locator", "support", "faq", "contact", "settings", "notifications", "history", "pay-bills"].includes(activeView)
            : activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "more") {
                  setActiveView("settings"); // Goes directly to more list/settings
                } else {
                  setActiveView(tab.id);
                }
              }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-[#0A63FF] text-white" : "text-gray-400"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-mono tracking-wider ${isActive ? "text-[#D8A63D] font-bold" : "text-gray-400"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// =============================================================
// =============================================================
// SUB-VIEW: 1. HOME DASHBOARD (Alex Johnson / Dashboard)
// =============================================================
function HomeView({
  user,
  accounts,
  checkingAcc,
  totalBalance,
  transactions,
  isBalanceHidden,
  setIsBalanceHidden,
  setActiveView,
  notifications,
  triggerNotification,
  cards
}: any) {
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use currency chosen/locked by admin for this user (preferredCurrency)
  const currency = (user.preferredCurrency && ["USD", "EUR", "GBP"].includes(user.preferredCurrency)) ? user.preferredCurrency : "USD";

  const exchangeRates: { [key: string]: { rate: number; symbol: string } } = {
    USD: { rate: 1, symbol: "$" },
    EUR: { rate: 0.91, symbol: "€" },
    GBP: { rate: 0.78, symbol: "£" }
  };

  const currentRate = exchangeRates[currency].rate;
  const currentSymbol = exchangeRates[currency].symbol;

  const mockupTotalBalance = 24560.80 * currentRate;
  const mockupAvailableBalance = 20540.80 * currentRate;

  const userCard = cards && cards.length > 0 ? cards[0] : { cardNumber: "4000 1234 5678 4587", expiryDate: "09/29" };

  const maskCardNumber = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.length < 10) return "***** ***";
    const middle = clean.slice(4, 10);
    return `***** ${middle}***`;
  };

  const maskExpiryDate = (date: string) => {
    const parts = date.split("/");
    if (parts.length === 2) {
      return `**/${parts[1]}`;
    }
    return "**/29";
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerNotification(
        "Dashboard Refreshed",
        "Your account balances, transaction logs, and exchange rates have been updated successfully.",
        "System"
      );
    }, 1200);
  };

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 text-left"
    >
      {/* Top Welcome Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={user.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
            className="w-12 h-12 rounded-full border border-[#D8A63D] object-cover hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setActiveView("profile")}
            alt="Profile"
          />
          <div>
            <span className="text-xs font-mono text-gray-400 block uppercase">Good Morning,</span>
            <span className="text-base font-bold text-white block">{user.firstName} {user.lastName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            type="button"
            className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors ${isRefreshing ? "animate-spin text-[#2563EB]" : "text-gray-300"}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView("notifications")}
            type="button"
            className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 border border-[#071C3F] rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Luxury Glassmorphism Visa Debit Card */}
      <div className="relative bg-gradient-to-br from-[#071B34] via-[#2563EB] to-[#1E3A8A] border border-white/15 rounded-[20px] p-6 shadow-2xl overflow-hidden min-h-[195px] flex flex-col justify-between">
        {/* Background Radial Glow */}
        <div className="absolute -right-20 -bottom-20 w-52 h-52 bg-gradient-to-tr from-[#D8A63D]/25 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gray-300">TOTAL BALANCE</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {isBalanceHidden ? "••••••" : `${currentSymbol}${mockupTotalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
              <button
                type="button"
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="text-gray-300 hover:text-white"
              >
                {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Available Balance: {isBalanceHidden ? "••••••" : `${currentSymbol}${mockupAvailableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Display Locked Currency chosen by Admin */}
            <div className="px-2.5 py-1.5 bg-white/10 border border-white/15 rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider">
              {currency} ({currentSymbol})
            </div>

            {/* Visa Gold Logo */}
            <div className="flex flex-col items-end">
              <span className="text-[#D8A63D] font-mono font-extrabold text-xs tracking-wider">PLATINUM</span>
              <svg className="w-12 h-6 text-white mt-1 fill-current" viewBox="0 0 24 24">
                <path d="M17 4l-1.5 8h3L20 4z M9.5 4L6.2 12h2.5l.6-1.5h3l.3 1.5h2.5L12 4z M2.5 4L1 9.5 0.5 4H0l1.2 8h2.6L6 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/10 mt-3">
          <div>
            <div className="text-[10px] font-mono tracking-wider text-gray-300">{user.firstName.toUpperCase()} {user.lastName.toUpperCase()}</div>
            <div className="text-sm font-mono tracking-widest text-white/95 mt-1">{maskCardNumber(userCard.cardNumber)}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-gray-400">EXPIRY</div>
            <div className="text-xs font-mono font-bold text-white">{maskExpiryDate(userCard.expiryDate)}</div>
          </div>
        </div>
      </div>

      {/* Swipe refresh simulator indicator */}
      <div className="text-center">
        <span className="text-[9px] text-gray-500 font-mono tracking-wider uppercase">Swipe down or tap top-right icon to pull-to-refresh</span>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Send", icon: Send, onClick: () => setActiveView("transfer") },
          { label: "Receive", icon: Download, onClick: () => setIsReceiveModalOpen(true) },
          { label: "Pay Bills", icon: FileText, onClick: () => setActiveView("pay-bills") },
          { label: "More", icon: Grid, onClick: () => setActiveView("settings") }
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={act.onClick}
              className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#2563EB]/15 border border-[#2563EB]/35 rounded-lg flex items-center justify-center text-[#2563EB]">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono tracking-wide font-semibold text-gray-200">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accounts Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase">Accounts</span>
          <button type="button" onClick={() => setActiveView("accounts")} className="text-xs text-[#2563EB] font-semibold flex items-center">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Checking Account */}
          <div
            onClick={() => setActiveView("accounts")}
            className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D8A63D]/10 flex items-center justify-center border border-[#D8A63D]/30 text-[#D8A63D]">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Checking Account</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">****4567</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {currentSymbol}{(12560.75 * currentRate).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Savings Account */}
          <div
            onClick={() => setActiveView("accounts")}
            className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D8A63D]/10 flex items-center justify-center border border-[#D8A63D]/30 text-[#D8A63D]">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Savings Account</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">****0163</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {currentSymbol}{(8250.30 * currentRate).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Credit Card Account */}
          <div
            onClick={() => setActiveView("cards")}
            className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center border border-[#2563EB]/30 text-[#2563EB]">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Credit Card</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">Card ending ****7890</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-400">
                -{currentSymbol}{(2980.00 * currentRate).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase">Recent Transactions</span>
          <button type="button" onClick={() => setActiveView("history")} className="text-xs text-[#2563EB] font-semibold flex items-center">
            <span>Statement</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {transactions.slice(0, 5).map((txn: any, i: number) => {
            const isNegative = txn.amount < 0;
            return (
              <div
                key={i}
                className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{txn.merchant}</div>
                  <div className="text-[10px] text-gray-400 mt-1 leading-none">{txn.category} • {new Date(txn.date).toLocaleDateString()}</div>
                </div>
                <div className={`text-right font-semibold text-sm ${isNegative ? "text-red-400" : "text-emerald-400"}`}>
                  {isNegative ? "-" : "+"}{currentSymbol}{Math.abs(txn.amount * currentRate).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECEIVE DISCOVERY MODAL */}
      <AnimatePresence>
        {isReceiveModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#071B34] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-center"
            >
              <h3 className="text-lg font-bold text-white mb-2">Receive Funds</h3>
              <p className="text-xs text-gray-400 mb-5">Share your dynamic QR code or secure account credentials to authorize wire deposits.</p>

              <div className="bg-white p-4 rounded-xl inline-block mb-5">
                <div className="w-40 h-40 bg-gray-100 flex flex-col items-center justify-center border-4 border-[#071B34]">
                  <div className="w-32 h-32 grid grid-cols-4 gap-2 opacity-80">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`rounded ${i % 3 === 0 || i % 5 === 2 ? "bg-[#071B34]" : "bg-transparent"}`} />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold font-mono text-[#071B34] mt-1">AURORA DIGITAL PAY</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left space-y-3 mb-6">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">ACCOUNT BENEFICIARY</span>
                  <div className="text-xs font-bold text-white">{user.firstName} {user.lastName}</div>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">ROUTING NUMBER (ABA)</span>
                  <div className="text-xs font-bold text-white font-mono">021000021</div>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">CHECKING ACCOUNT NUMBER</span>
                  <div className="text-xs font-bold text-white font-mono flex justify-between items-center">
                    <span>{checkingAcc.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(checkingAcc.accountNumber);
                        alert("Account number copied to clipboard!");
                      }}
                      className="text-[#2563EB] text-[10px] hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="w-full py-3 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 2. ACCOUNTS VIEW (Lists checking, savings, etc.)
// =============================================================
function AccountsView({ accounts, triggerNotification, syncDB, user }: any) {
  const [selectedAcc, setSelectedAcc] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [newAccType, setNewAccType] = useState(AccountType.SAVINGS);
  const [newAccCurrency, setNewAccCurrency] = useState("USD");
  const [initialDeposit, setInitialDeposit] = useState("500");

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const deposit = parseFloat(initialDeposit);
    if (isNaN(deposit) || deposit < 100) {
      alert("Minimum initial deposit of $100.00 required.");
      return;
    }

    const generatedNo = `AU • ${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(1000 + Math.random() * 8999)}`;
    
    const newAccount = {
      id: `ACC-${Math.floor(1000 + Math.random() * 8999)}`,
      userId: accounts[0]?.userId || "AUR-alex",
      accountNumber: generatedNo,
      type: newAccType,
      balance: deposit,
      currency: newAccCurrency,
      status: "Active" as any,
      createdAt: new Date().toISOString()
    };

    await AuroraDB.saveAccount(newAccount);
    setIsCreateOpen(false);
    triggerNotification(
      "New Account Activated",
      `Your premium ${newAccType} has been successfully opened with ${newAccCurrency} ${deposit.toFixed(2)}.`,
      "System"
    );
    alert(`[ACCOUNT OPENED] New ${newAccType} opened successfully!`);
  };

  const toggleFreeze = async (account: any) => {
    const nextStatus = account.status === "Active" ? "Frozen" : "Active";
    const updatedAcc = {
      ...account,
      status: nextStatus as any
    };
    await AuroraDB.saveAccount(updatedAcc);
    triggerNotification(
      `Account ${nextStatus}`,
      `Your account ${account.accountNumber} has been ${nextStatus.toLowerCase()} successfully.`,
      "Security"
    );
    if (selectedAcc?.id === account.id) {
      setSelectedAcc(updatedAcc);
    }
  };

  const handleDownloadStatement = (acc: any) => {
    alert(`[STATEMENT SUCCESS] PDF Statement generated for account ${acc.accountNumber}. Downloading...`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">My Accounts</h2>
          <p className="text-gray-400 text-xs">Manage your checking, savings, business & joint assets.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          type="button"
          className="w-10 h-10 rounded-full bg-[#2563EB] hover:bg-blue-600 flex items-center justify-center text-white cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {accounts.map((acc: any, i: number) => {
          let interestLabel = "";
          let detailLabel = "";
          let ownersLabel = "";
          
          if (acc.type === AccountType.SAVINGS) {
            interestLabel = "Interest Rate: 4.25% APY";
          } else if (acc.type === AccountType.BUSINESS) {
            detailLabel = "Business Name: Alex Johnson Design LLC";
          } else if (acc.type === AccountType.FIXED_DEPOSIT) {
            detailLabel = "Maturity Date: Dec 15, 2027 • Interest Earned: $1,250.00";
          } else if (acc.type === AccountType.JOINT) {
            ownersLabel = "Account Holders: Alex Johnson, Sarah Johnson";
          }

          return (
            <div
              key={i}
              onClick={() => setSelectedAcc(acc)}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 hover:border-[#2563EB]/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono px-2.5 py-1 bg-[#2563EB]/20 border border-[#2563EB]/40 rounded-full text-blue-400">
                    {acc.type}
                  </span>
                  <div className="text-lg font-bold mt-2 font-mono text-white">{acc.accountNumber}</div>
                  
                  {interestLabel && <div className="text-xs text-amber-400 font-mono mt-1">{interestLabel}</div>}
                  {detailLabel && <div className="text-xs text-gray-300 font-mono mt-1">{detailLabel}</div>}
                  {ownersLabel && <div className="text-xs text-gray-300 font-mono mt-1">{ownersLabel}</div>}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${acc.status === "Active" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" : "bg-red-500/15 border border-red-500/30 text-red-400"}`}>
                    {acc.status}
                  </span>
                  <div className="text-xl font-black text-white mt-1.5">
                    ${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#2563EB] font-semibold flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Details & Settings</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#071B34] border border-white/10 rounded-2xl p-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Open Premium Account</h3>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="p-1 rounded bg-white/5 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">ACCOUNT TYPE</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value={AccountType.SAVINGS} className="bg-[#071B34]">Savings Account (4.25% APY)</option>
                    <option value={AccountType.BUSINESS} className="bg-[#071B34]">Business Account</option>
                    <option value={AccountType.FIXED_DEPOSIT} className="bg-[#071B34]">Fixed Deposit Asset</option>
                    <option value={AccountType.JOINT} className="bg-[#071B34]">Joint Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">CURRENCY</label>
                  <select
                    value={newAccCurrency}
                    onChange={e => setNewAccCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white cursor-pointer"
                  >
                    <option value="USD" className="bg-[#071B34]">USD ($)</option>
                    <option value="EUR" className="bg-[#071B34]">EUR (€)</option>
                    <option value="GBP" className="bg-[#071B34]">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">INITIAL DEPOSIT (MIN $100)</label>
                  <input
                    type="number"
                    value={initialDeposit}
                    onChange={e => setInitialDeposit(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-bold text-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white"
                >
                  Confirm Account Activation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAcc && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#071B34] border border-white/10 rounded-2xl p-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-5">
                <span className="text-xs font-mono text-blue-400 tracking-wider uppercase font-bold">{selectedAcc.type}</span>
                <button type="button" onClick={() => setSelectedAcc(null)} className="p-1 rounded bg-white/5 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-4 bg-white/5 border border-white/5 rounded-2xl mb-6">
                <span className="text-[10px] font-mono text-gray-400 block uppercase">CURRENT BALANCE</span>
                <div className="text-2xl font-black text-white mt-1">
                  ${selectedAcc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">Account No: {selectedAcc.accountNumber}</span>
              </div>

              <div className="space-y-4">
                <div className="border-b border-white/10 pb-4">
                  <h4 className="text-xs font-mono text-[#D8A63D] mb-2 uppercase">Account Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadStatement(selectedAcc)}
                      className="py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Statement</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFreeze(selectedAcc)}
                      className={`py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${selectedAcc.status === "Active" ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"}`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>{selectedAcc.status === "Active" ? "Freeze" : "Unfreeze"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-[#D8A63D] uppercase">Asset Information</h4>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-xs font-mono space-y-2.5">
                    <div className="flex justify-between text-gray-300">
                      <span>Status:</span>
                      <span className="text-white font-bold">{selectedAcc.status}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Currency Code:</span>
                      <span className="text-white font-bold">{selectedAcc.currency}</span>
                    </div>
                    {selectedAcc.type === AccountType.SAVINGS && (
                      <div className="flex justify-between text-gray-300">
                        <span>Interest Rate:</span>
                        <span className="text-emerald-400 font-bold">4.25% APY</span>
                      </div>
                    )}
                    {selectedAcc.type === AccountType.BUSINESS && (
                      <div className="flex justify-between text-gray-300">
                        <span>Registered LLC:</span>
                        <span className="text-white font-bold">Alex Johnson Design</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300">
                      <span>Activation Date:</span>
                      <span className="text-white font-bold">{new Date(selectedAcc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAcc(null)}
                className="w-full py-3 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white mt-6"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 3. TRANSFER MONEY (Domestic & International)
// =============================================================
function TransferView({ accounts, beneficiaries, triggerNotification, syncDB, user }: any) {
  const [tab, setTab] = useState<"Domestic" | "International">("Domestic");
  const [transferType, setTransferType] = useState<"Own Account" | "Aurora Bank" | "Other Banks">("Other Banks");
  
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("Aurora Bank");
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [pin, setPin] = useState("");
  const [sourceAccId, setSourceAccId] = useState(accounts[0]?.id || "");
  const [currency, setCurrency] = useState("USD");
  const [refNo, setRefNo] = useState("");
  
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);

  const calculateFee = () => {
    if (transferType === "Own Account") return 0;
    return tab === "Domestic" ? 1.50 : 15.00;
  };

  const calculateTotal = () => {
    const val = parseFloat(amount) || 0;
    return val + calculateFee();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (transferType === "Own Account") {
      if (!sourceAccId || !accountNo) {
        setError("Please choose a source and destination account.");
        return;
      }
      if (sourceAccId === accountNo) {
        setError("Source and destination accounts must be different.");
        return;
      }
    } else {
      if (!recipient || !accountNo || !bank) {
        setError("Please fill out all mandatory transfer fields.");
        return;
      }
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    const sourceAcc = accounts.find((a: any) => a.id === sourceAccId);
    if (!sourceAcc) {
      setError("Source bank account not found.");
      return;
    }

    if (sourceAcc.balance < calculateTotal()) {
      setError("Insufficient fund reserves in selected account (including transfer fees).");
      return;
    }

    setStep(2);
  };

  const handleConfirmTransfer = async (securityMethod: "PIN" | "FaceID" | "Fingerprint") => {
    setError("");

    if (securityMethod === "PIN" && pin !== user.transactionPin) {
      setError("Incorrect Transaction security PIN.");
      return;
    }

    const value = parseFloat(amount);
    const fee = calculateFee();
    const total = calculateTotal();

    const state = AuroraDB.getState();
    const sourceAcc = state.accounts.find((a: any) => a.id === sourceAccId);
    
    if (!sourceAcc) {
      setError("Source account not found.");
      return;
    }

    if (sourceAcc.balance < total) {
      setError("Insufficient funds.");
      return;
    }

    const updatedSourceAcc = {
      ...sourceAcc,
      balance: sourceAcc.balance - total
    };
    await AuroraDB.saveAccount(updatedSourceAcc);

    if (transferType === "Own Account") {
      const destAcc = state.accounts.find((a: any) => a.id === accountNo);
      if (destAcc) {
        const updatedDestAcc = {
          ...destAcc,
          balance: destAcc.balance + value
        };
        await AuroraDB.saveAccount(updatedDestAcc);
      }
    }

    const ref = refNo || `FT${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
      userId: user.id,
      accountId: sourceAcc.id,
      amount: -total,
      category: "Transfer" as any,
      merchant: transferType === "Own Account" ? "Own Account Transfer" : recipient,
      description: desc || `Transfer to ${recipient}`,
      date: new Date().toISOString(),
      status: "Completed" as any,
      referenceNumber: ref
    };

    await AuroraDB.saveTransaction(newTxn);

    triggerNotification(
      "Transfer Successful",
      `Dispatched ${currency} ${value.toFixed(2)} to ${transferType === "Own Account" ? "your account" : recipient}. Fee: $${fee.toFixed(2)}.`,
      "Transaction"
    );

    setReceiptDetails({
      ref,
      recipient: transferType === "Own Account" ? "Own Account Transfer" : recipient,
      bank: transferType === "Own Account" ? "Aurora Bank" : bank,
      accountNo,
      amount: value,
      fee,
      total,
      date: new Date().toLocaleString(),
      sourceNo: sourceAcc.accountNumber
    });
    setStep(3);

    setRecipient("");
    setAccountNo("");
    setAmount("");
    setDesc("");
    setPin("");
    setRefNo("");
  };

  const selectBeneficiary = (ben: any) => {
    setRecipient(ben.name);
    setBank(ben.bankName);
    setAccountNo(ben.accountNumber.replace(/[^0-9]/g, "") || "90218491");
    setTransferType("Other Banks");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left"
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Transfer Money</h2>
        <p className="text-gray-400 text-xs">Execute direct wire transfers safely across accounts and carriers.</p>
      </div>

      {step === 1 && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
            {["Domestic", "International"].map((t: any) => (
              <button
                type="button"
                key={t}
                onClick={() => setTab(t)}
                className={`py-2 rounded-lg font-mono text-xs font-semibold cursor-pointer ${tab === t ? "bg-[#2563EB] text-white shadow" : "text-gray-400"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5">TRANSFER OPTION</label>
            <div className="grid grid-cols-3 gap-2">
              {["Own Account", "Aurora Bank", "Other Banks"].map((type: any) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    setTransferType(type);
                    if (type === "Own Account") {
                      setBank("Aurora Bank");
                      setRecipient("Own Account");
                    } else if (type === "Aurora Bank") {
                      setBank("Aurora Bank");
                    }
                  }}
                  className={`py-2.5 rounded-xl text-center text-xs font-semibold cursor-pointer border ${transferType === type ? "bg-[#2563EB]/15 border-[#2563EB] text-[#2563EB]" : "bg-white/5 border-white/10 text-gray-400"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {beneficiaries.length > 0 && transferType !== "Own Account" && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block mb-2">Saved Beneficiaries</span>
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {beneficiaries.map((ben: any, i: number) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => selectBeneficiary(ben)}
                    className="shrink-0 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white">{ben.name}</div>
                    <div className="text-[9px] text-gray-400 font-mono mt-0.5">{ben.bankName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5">SOURCE ACCOUNT</label>
            <select
              value={sourceAccId}
              onChange={e => setSourceAccId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-xs text-gray-200 cursor-pointer"
            >
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id} className="bg-[#071B34] text-white">
                  {acc.type} - (${acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {transferType === "Own Account" ? (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">DESTINATION ACCOUNT</label>
              <select
                value={accountNo}
                onChange={e => setAccountNo(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-xs text-gray-200 cursor-pointer"
              >
                <option value="" className="bg-[#071B34] text-gray-400">-- Select recipient account --</option>
                {accounts.filter((a: any) => a.id !== sourceAccId).map((acc: any) => (
                  <option key={acc.id} value={acc.id} className="bg-[#071B34] text-white">
                    {acc.type} - (${acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">RECIPIENT NAME</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="e.g. David Smith"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">DESTINATION BANK</label>
                  <input
                    type="text"
                    value={bank}
                    disabled={transferType === "Aurora Bank"}
                    onChange={e => setBank(e.target.value)}
                    placeholder="e.g. Chase Bank"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">ACCOUNT NUMBER</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter account credentials"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono text-white"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">AMOUNT</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-bold text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">CURRENCY</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-xs text-white cursor-pointer"
              >
                <option value="USD" className="bg-[#071B34]">USD ($)</option>
                <option value="EUR" className="bg-[#071B34]">EUR (€)</option>
                <option value="GBP" className="bg-[#071B34]">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">REFERENCE NUMBER (OPTIONAL)</label>
              <input
                type="text"
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                placeholder="Reference Code"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">MEMO / REFERENCE DESCRIPTION</label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. rent, savings, gift"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs text-white"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-4">
            <button
              type="button"
              onClick={() => {
                setRecipient("");
                setAccountNo("");
                setAmount("");
                setDesc("");
              }}
              className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Continue Transfer</span>
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => alert("Scan QR Transfer feature initiated. Camera viewfinder active (simulated).")}
              className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 font-mono flex items-center justify-center gap-2"
            >
              <span>📷 QR Code Scan</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Scheduled recurring transfers folder opened. Create a scheduled transfer.")}
              className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 font-mono flex items-center justify-center gap-2"
            >
              <span>📅 Scheduled Transfers</span>
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">Confirm Your Transfer</h3>
            <p className="text-xs text-gray-400 mt-1">Please double check transfer metrics before confirming.</p>
          </div>

          <div className="space-y-3 bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-mono">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Recipient:</span>
              <span className="font-bold text-white">{transferType === "Own Account" ? "Own Account Transfer" : recipient}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Destination Bank:</span>
              <span className="font-bold text-white">{bank}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Account Number:</span>
              <span className="font-bold text-white">{accountNo}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Transfer Amount:</span>
              <span className="font-bold text-white">{currency} {parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Transfer Fee:</span>
              <span className="font-bold text-amber-400">${calculateFee().toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-base pt-1">
              <span className="text-gray-200 font-bold">Total Cost:</span>
              <span className="font-bold text-emerald-400">${calculateTotal().toFixed(2)} USD</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Authorize with Transaction PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono tracking-widest text-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmTransfer("FaceID")}
                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-[10px] text-gray-300 flex items-center justify-center gap-1"
              >
                <span>Face ID Auth</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirmTransfer("Fingerprint")}
                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-[10px] text-gray-300 flex items-center justify-center gap-1"
              >
                <span>Touch ID Auth</span>
              </button>
            </div>

            {error && (
              <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs text-white"
              >
                Back to Form
              </button>
              <button
                type="button"
                onClick={() => handleConfirmTransfer("PIN")}
                className="py-3 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white shadow-lg"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && receiptDetails && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">Transfer Dispatched</h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">TRANSACTION SUCCESSFUL</span>
          </div>

          <div className="space-y-3 bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-mono">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">REF NUMBER:</span>
              <span className="font-bold text-white">{receiptDetails.ref}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">AMOUNT SENT:</span>
              <span className="font-bold text-emerald-400">${receiptDetails.amount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">RECIPIENT:</span>
              <span className="font-bold text-white">{receiptDetails.recipient}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">BANK / NO:</span>
              <span className="font-bold text-white">{receiptDetails.bank} ({receiptDetails.accountNo})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">TIMESTAMP:</span>
              <span className="font-bold text-white">{receiptDetails.date}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => alert("Statement receipt downloaded successfully to local storage.")}
              className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-xs text-white"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 4. PAY BILLS
// =============================================================
function PayBillsView({ accounts, triggerNotification, syncDB, user }: any) {
  const [category, setCategory] = useState<any>("Electricity");
  const [provider, setProvider] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [refNo, setRefNo] = useState("");
  const [sourceAccId, setSourceAccId] = useState(accounts[0]?.id || "");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [paymentDate, setPaymentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const providersMap: { [key: string]: string[] } = {
    Electricity: ["ConEd New York", "Pacific Gas & Elec", "National Grid"],
    Water: ["NYC Water Board", "Aqua America", "American Water"],
    Internet: ["Comcast Xfinity", "Verizon Fios", "Spectrum Internet"],
    Mobile: ["AT&T Wireless", "T-Mobile Premium", "Verizon Cellular"],
    TV: ["DirecTV Stream", "Hulu Premium", "Netflix Plus"],
    Insurance: ["Geico Car Insurance", "State Farm Auto", "MetLife Life"],
    "School Fees": ["Columbia University", "NYU Tuition Pool", "City College NY"],
    Taxes: ["IRS Federal Taxes", "NY State Tax Authority", "Municipal Council"]
  };

  const getServiceCharge = () => {
    return 2.00;
  };

  const calculateTotal = () => {
    const val = parseFloat(amount) || 0;
    return val + getServiceCharge();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!provider || !accountNo || !amount) {
      setError("Please fill out all billing details.");
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid bill payment amount.");
      return;
    }

    const sourceAcc = accounts.find((a: any) => a.id === sourceAccId);
    if (!sourceAcc) {
      setError("Source bank account not found.");
      return;
    }

    if (sourceAcc.balance < calculateTotal()) {
      setError("Insufficient checking or savings balances to cover this bill & service fee.");
      return;
    }

    setStep(2);
  };

  const handleConfirmPayment = async (securityMethod: "PIN" | "FaceID" | "Fingerprint") => {
    setError("");

    if (securityMethod === "PIN" && pin !== user.transactionPin) {
      setError("Incorrect Transaction security PIN.");
      return;
    }

    const value = parseFloat(amount);
    const serviceFee = getServiceCharge();
    const total = calculateTotal();

    const state = AuroraDB.getState();
    const sourceAcc = state.accounts.find((a: any) => a.id === sourceAccId);

    if (!sourceAcc || sourceAcc.balance < total) {
      setError("Insufficient checking or savings balances.");
      return;
    }

    const updatedSourceAcc = {
      ...sourceAcc,
      balance: sourceAcc.balance - total
    };
    await AuroraDB.saveAccount(updatedSourceAcc);

    const ref = refNo || `BP${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
      userId: user.id,
      accountId: sourceAcc.id,
      amount: -total,
      category: TransactionCategory.UTILITIES,
      merchant: provider,
      description: `Billing Payment Ref ${ref}`,
      date: new Date().toISOString(),
      status: "Completed" as any,
      referenceNumber: ref
    };

    await AuroraDB.saveTransaction(newTxn);

    triggerNotification(
      "Bill Paid Successfully",
      `Dispatched payment of $${value.toFixed(2)} to ${provider}. Fee: $2.00.`,
      "Transaction"
    );

    console.log(`[AURORA BILL NOTIF] Email & SMS dispatched successfully to registered channels for payment ref: ${ref}`);
    alert(`[BILL PAID] Successfully disbursed $${value.toFixed(2)} to ${provider}. Fee: $2.00. Ref: ${ref}`);

    setAccountNo("");
    setAmount("");
    setPin("");
    setRefNo("");
    setStep(1);
  };

  const recentPaymentsMock = [
    { provider: "ConEd Electricity", date: "2026-06-25", amount: -120.50, status: "Success" },
    { provider: "Verizon Fios Internet", date: "2026-06-21", amount: -59.00, status: "Success" },
    { provider: "DirecTV Stream TV", date: "2026-06-18", amount: -25.00, status: "Success" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left"
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Pay Bills</h2>
        <p className="text-gray-400 text-xs">Settle utility bills, school fees, cell phone, and taxes dynamically.</p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase">Bill Categories</span>
              <span className="text-[10px] font-mono text-gray-500 uppercase">Category Dropdown: All Categories</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(providersMap).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setProvider(providersMap[cat][0]);
                  }}
                  className={`py-2.5 rounded-xl font-mono text-[9px] font-bold text-center border cursor-pointer leading-tight ${category === cat ? "bg-[#2563EB] border-[#2563EB] text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">SELECT BILL PROVIDER</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white cursor-pointer"
              >
                <option value="" className="bg-[#071B34] text-gray-400">-- Choose utility carrier --</option>
                {providersMap[category]?.map((p) => (
                  <option key={p} value={p} className="bg-[#071B34] text-white">{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">CUSTOMER NUMBER / BILL ID</label>
              <input
                type="text"
                value={accountNo}
                onChange={e => setAccountNo(e.target.value)}
                placeholder="Account Credentials with Provider"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">SOURCE WALLET ACCOUNT</label>
              <select
                value={sourceAccId}
                onChange={e => setSourceAccId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-xs text-gray-200 cursor-pointer"
              >
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id} className="bg-[#071B34] text-white">
                    {acc.type} - (${acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">BILL AMOUNT</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-bold text-red-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">PAYMENT DATE</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">REFERENCE MEMO (OPTIONAL)</label>
              <input
                type="text"
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                placeholder="Billing Memo Reference"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono text-white"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold shadow-lg shadow-blue-500/15 text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Continue to Confirmation</span>
            </button>
          </form>

          <div className="pt-4 border-t border-white/10">
            <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block mb-3">Recent Payments</span>
            <div className="space-y-2.5">
              {recentPaymentsMock.map((p, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{p.provider}</div>
                    <div className="text-[10px] text-gray-400 mt-1 leading-none">{p.date} • {p.status}</div>
                  </div>
                  <div className="text-right font-semibold text-sm text-red-400">
                    -${Math.abs(p.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">Confirm Bill Payment</h3>
            <p className="text-xs text-gray-400 mt-1">Settle account statement credentials with provider.</p>
          </div>

          <div className="space-y-3 bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-mono">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Provider:</span>
              <span className="font-bold text-white">{provider}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Customer Number:</span>
              <span className="font-bold text-white">{accountNo}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Payment Amount:</span>
              <span className="font-bold text-white">${parseFloat(amount).toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Service Fee:</span>
              <span className="font-bold text-amber-400">${getServiceCharge().toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Settle Date:</span>
              <span className="font-bold text-white">{paymentDate}</span>
            </div>
            <div className="flex justify-between text-base pt-1">
              <span className="text-gray-200 font-bold">Total Payout:</span>
              <span className="font-bold text-emerald-400">${calculateTotal().toFixed(2)} USD</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Confirm with Transaction PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2563EB] text-xs font-mono tracking-widest text-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmPayment("FaceID")}
                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-[10px] text-gray-300 flex items-center justify-center gap-1"
              >
                <span>Face ID Auth</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPayment("Fingerprint")}
                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-[10px] text-gray-300 flex items-center justify-center gap-1"
              >
                <span>Touch ID Auth</span>
              </button>
            </div>

            {error && (
              <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs text-white"
              >
                Back to Form
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPayment("PIN")}
                className="py-3 bg-[#2563EB] hover:brightness-110 rounded-xl font-bold text-xs text-white shadow-lg"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 5. CARDS (Set spending, Change PIN, Freeze)
// =============================================================
function CardsView({ cards, accounts, triggerNotification, syncDB, user, setActiveView }: any) {
  const [activeTab, setActiveTab] = useState<"Debit Card" | "Credit Card" | "Virtual Card">("Debit Card");
  
  // Filter cards based on selected tab
  const tabFilteredCards = cards.filter((c: any) => c.type === activeTab);
  
  // Track active card index in the filtered cards
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Clamp index if filtered cards changes
  useEffect(() => {
    setActiveCardIndex(0);
  }, [activeTab]);

  const activeCard = tabFilteredCards[activeCardIndex];

  // Card details visibility
  const [isCvvVisible, setIsCvvVisible] = useState(false);
  const [revealFullDetails, setRevealFullDetails] = useState(false);

  const maskCardNumber = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.length < 10) return "***** ***";
    const middle = clean.slice(4, 10);
    return `***** ${middle}***`;
  };

  const maskExpiryDate = (date: string) => {
    const parts = date.split("/");
    if (parts.length === 2) {
      return `**/${parts[1]}`;
    }
    return "**/29";
  };

  // Modals / Pin Security states
  const [securityModal, setSecurityModal] = useState<{
    isOpen: boolean;
    action: string;
    payload?: any;
    error?: string;
  }>({ isOpen: false, action: "" });

  const [pinInput, setPinInput] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");

  const triggerSecurity = (action: string, payload?: any) => {
    setPinInput("");
    setSecurityModal({
      isOpen: true,
      action,
      payload,
      error: ""
    });
  };

  const handleSecuritySuccess = async (method: "PIN" | "BIOMETRIC") => {
    if (method === "PIN" && pinInput !== user.transactionPin) {
      setSecurityModal(prev => ({ ...prev, error: "Incorrect Transaction security PIN." }));
      return;
    }

    const { action, payload } = securityModal;
    setSecurityModal({ isOpen: false, action: "" });

    const state = AuroraDB.getState();
    const dbCard = state.cards.find((c: any) => c.id === activeCard?.id);

    if (action === "REVEAL_DETAILS") {
      setRevealFullDetails(true);
      setIsCvvVisible(true);
      triggerNotification(
        "Card Credentials Revealed",
        `Full details revealed for card ending ${activeCard.cardNumber.slice(-4)}.`,
        "Security"
      );
    } else if (action === "FREEZE_TOGGLE") {
      if (dbCard) {
        const nextStatus = dbCard.status === CardStatus.ACTIVE ? CardStatus.FROZEN : CardStatus.ACTIVE;
        const updatedCard = { ...dbCard, status: nextStatus };
        await AuroraDB.saveCard(updatedCard);
        triggerNotification(
          `Card ${nextStatus}`,
          `Your card ending in ${dbCard.cardNumber.slice(-4)} has been ${(nextStatus || "").toLowerCase()} successfully.`,
          "Security"
        );
      }
    } else if (action === "CHANGE_PIN") {
      if (dbCard && payload?.pin) {
        const updatedCard = { ...dbCard, pin: payload.pin };
        await AuroraDB.saveCard(updatedCard);
        triggerNotification(
          "Card PIN Updated",
          `ATM security PIN updated for card ending ${dbCard.cardNumber.slice(-4)}.`,
          "Security"
        );
        alert("[PIN SECURITY] Card ATM PIN successfully updated!");
      }
    } else if (action === "CHANGE_LIMIT") {
      if (dbCard && payload?.limit) {
        const updatedCard = { ...dbCard, dailyLimit: payload.limit };
        await AuroraDB.saveCard(updatedCard);
        triggerNotification(
          "Spending Limit Updated",
          `Daily spending limit for card ending ${dbCard.cardNumber.slice(-4)} set to $${payload.limit}.`,
          "Security"
        );
        alert(`[LIMIT UPDATED] Daily transaction limit set to $${payload.limit.toLocaleString()}`);
      }
    } else if (action === "REPLACE_LOST") {
      if (dbCard) {
        const mockNewNo = `4000 ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`;
        const updatedCard = {
          ...dbCard,
          cardNumber: mockNewNo,
          expiryDate: "09/31",
          cvv: String(Math.floor(100 + Math.random()*900)),
          status: CardStatus.ACTIVE
        };
        const secLog = {
          id: `SEC-${Math.floor(10000 + Math.random()*90000)}`,
          userId: user.id,
          event: `Card Replaced (Ending ${mockNewNo.slice(-4)})`,
          device: "iPhone 15 Pro",
          location: "New York, USA",
          date: new Date().toISOString(),
          status: "Success" as any
        };
        await AuroraDB.saveCard(updatedCard);
        await AuroraDB.saveSecurityLog(secLog);
        triggerNotification(
          "Replacement Card Requested",
          `Lost card replaced. New card ending in ${mockNewNo.slice(-4)} is now active.`,
          "Security"
        );
        alert(`[REPLACEMENT CONFIRMED] Card replaced successfully! New card number ending in ${mockNewNo.slice(-4)} is now ready for use.`);
      }
    } else if (action === "REPORT_STOLEN") {
      if (dbCard) {
        const updatedCard = { ...dbCard, status: CardStatus.REPLACED };
        const secLog = {
          id: `SEC-${Math.floor(10000 + Math.random()*90000)}`,
          userId: user.id,
          event: `Card Reported Stolen (Ending ${dbCard.cardNumber.slice(-4)})`,
          device: "iPhone 15 Pro",
          location: "New York, USA",
          date: new Date().toISOString(),
          status: "Success" as any
        };
        await AuroraDB.saveCard(updatedCard);
        await AuroraDB.saveSecurityLog(secLog);
        triggerNotification(
          "Card Terminated",
          `Stolen card ending ${dbCard.cardNumber.slice(-4)} has been permanently closed.`,
          "Security"
        );
        alert("[CARD LOCKED] Card blocked permanently. A representative will reach out to issue physical replacement.");
      }
    } else if (action === "PROVISION_VIRTUAL") {
      const mockCardNo = `4853 ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`;
      const newVC: any = {
        id: `CARD-${Math.floor(90000 + Math.random()*9999)}`,
        userId: user.id,
        accountId: accounts[0]?.id || "ACC-5521",
        cardNumber: mockCardNo,
        expiryDate: "12/30",
        cvv: String(Math.floor(100 + Math.random()*900)),
        type: "Virtual Card",
        status: "Active",
        dailyLimit: 2500,
        spentToday: 0,
        pin: "0000",
        onlineLocked: false,
        atmLocked: true,
        intlLocked: false
      };

      await AuroraDB.saveCard(newVC);
      setActiveTab("Virtual Card");
      triggerNotification(
        "Virtual Card Provisioned",
        `Dynamic multi-use virtual card issued successfully.`,
        "Security"
      );
      alert(`[VIRTUAL CARD ISSUED] Card Number: ${mockCardNo}`);
    }
  };

  const handleToggleLockPreference = async (prefKey: "onlineLocked" | "atmLocked" | "intlLocked") => {
    if (!activeCard) return;
    const state = AuroraDB.getState();
    const dbCard = state.cards.find((c: any) => c.id === activeCard.id);
    if (dbCard) {
      const updatedCard = {
        ...dbCard,
        [prefKey]: !dbCard[prefKey]
      };
      await AuroraDB.saveCard(updatedCard);
      triggerNotification(
        "Card Preference Changed",
        `Card control preference updated for card ending in ${activeCard.cardNumber.slice(-4)}.`,
        "Security"
      );
    }
  };

  const handleDownloadStatement = () => {
    alert(`[STATEMENT DOWNLOAD] Mock PDF Card Statement for card ending in ${activeCard?.cardNumber.slice(-4)} generated and saved to device.`);
  };

  const handleCreateVirtualCardDirect = () => {
    triggerSecurity("PROVISION_VIRTUAL");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveView("home")}
          type="button"
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <span>← Back</span>
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Cards</h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Card Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1 rounded-xl">
        {(["Debit Card", "Credit Card", "Virtual Card"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-2 rounded-lg font-mono text-[10px] font-bold tracking-wide transition-all ${activeTab === tab ? "bg-[#2563EB] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Large Realistic 3D Bank Card Display */}
      {tabFilteredCards.length > 0 ? (
        <div className="space-y-4">
          <div className="relative group perspective">
            {/* Card Shell */}
            <motion.div
              key={activeCard?.id}
              initial={{ rotateY: -10, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`p-6 rounded-[24px] bg-gradient-to-br ${
                activeTab === "Debit Card" 
                  ? "from-[#0A1B3A] via-[#1E3A8A] to-[#0D1B2A]" 
                  : activeTab === "Credit Card" 
                  ? "from-[#2C1D06] via-[#B4842E] to-[#120F08]" 
                  : "from-[#1A0B2E] via-[#5B21B6] to-[#0B051D]"
              } border border-white/20 text-white relative shadow-2xl min-h-[210px] flex flex-col justify-between overflow-hidden transform transition-transform hover:scale-[1.02] duration-300`}
            >
              {/* Background Geometric Overlay patterns */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Row: Brand & Type */}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="text-xs font-black tracking-widest text-[#D8A63D]">AURORA BANK</span>
                  <span className="block text-[8px] font-mono tracking-widest text-gray-300 uppercase mt-0.5">
                    {activeCard.type} • PLATINUM PREFERRED
                  </span>
                </div>
                {/* Contactless wave & Chip SVG */}
                <div className="flex items-center gap-3">
                  {/* Wireless contactless symbol */}
                  <svg className="w-5 h-5 text-gray-300 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12a7 7 0 0 1 7-7v0" />
                    <path d="M5 12a11 11 0 0 1 11-11v0" />
                    <path d="M5 12a3 3 0 0 1 3-3v0" />
                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Middle Row: EMV Chip & Logo */}
              <div className="flex justify-between items-center relative z-10 my-1">
                {/* Realistic EMV chip */}
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-0.5 shadow border border-white/10 flex flex-col justify-between">
                  <div className="h-full w-full grid grid-cols-3 gap-0.5 opacity-60">
                    <div className="border-r border-b border-gray-900/40" />
                    <div className="border-r border-b border-gray-900/40" />
                    <div className="border-b border-gray-900/40" />
                    <div className="border-r border-gray-900/40" />
                    <div className="border-r border-gray-900/40" />
                    <div className="border-gray-900/40" />
                  </div>
                </div>

                {/* Mastercard/Visa Stylized Logo */}
                <div className="text-right">
                  {activeTab === "Debit Card" ? (
                    <div className="flex items-center gap-1 font-extrabold italic text-lg tracking-tight">
                      <span className="text-[#2563EB]">V</span>
                      <span className="text-white">I</span>
                      <span className="text-amber-500">S</span>
                      <span className="text-emerald-400">A</span>
                    </div>
                  ) : activeTab === "Credit Card" ? (
                    <div className="flex items-center gap-0.5">
                      <div className="w-6 h-6 rounded-full bg-red-500 opacity-90" />
                      <div className="w-6 h-6 rounded-full bg-amber-500 -ml-3 opacity-90" />
                    </div>
                  ) : (
                    <span className="text-xs font-bold font-mono tracking-widest text-[#D8A63D]">AURORA SECURE</span>
                  )}
                </div>
              </div>

              {/* Card Number (masked or visible) */}
              <div className="relative z-10 py-1">
                <span className="text-lg md:text-xl font-mono tracking-[0.2em] text-white/95 font-bold">
                  {revealFullDetails ? activeCard.cardNumber : maskCardNumber(activeCard.cardNumber)}
                </span>
              </div>

              {/* Bottom Row: Holder Name & Expiry */}
              <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-2.5">
                <div>
                  <span className="text-[7px] font-mono tracking-widest text-gray-400 block uppercase">CARD HOLDER</span>
                  <span className="text-xs font-mono font-bold text-white tracking-wider mt-0.5 block">
                    {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-[7px] font-mono tracking-widest text-gray-400 block uppercase">EXPIRES</span>
                    <span className="text-xs font-mono font-bold text-white tracking-wider mt-0.5 block">
                      {revealFullDetails ? activeCard.expiryDate : maskExpiryDate(activeCard.expiryDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] font-mono tracking-widest text-gray-400 block uppercase">CVV</span>
                    <span className="text-xs font-mono font-bold text-white tracking-wider mt-0.5 block">
                      {isCvvVisible ? activeCard.cvv : "•••"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Swipe indicator/Arrows to change card if multiple of the same category exist */}
          {tabFilteredCards.length > 1 && (
            <div className="flex justify-between items-center px-4">
              <button
                onClick={() => {
                  setActiveCardIndex(prev => (prev === 0 ? tabFilteredCards.length - 1 : prev - 1));
                  setRevealFullDetails(false);
                  setIsCvvVisible(false);
                }}
                className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-gray-300 font-mono"
              >
                ← Prev Card
              </button>
              <div className="flex gap-1.5">
                {tabFilteredCards.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeCardIndex === idx ? "bg-[#2563EB] w-3" : "bg-gray-600"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  setActiveCardIndex(prev => (prev === tabFilteredCards.length - 1 ? 0 : prev + 1));
                  setRevealFullDetails(false);
                  setIsCvvVisible(false);
                }}
                className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-gray-300 font-mono"
              >
                Next Card →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty tab state for Virtual Card */
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Dynamic Virtual Cards Active</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Generate disposable credit lines instantly. Shield your core accounts from merchant trackers.</p>
          </div>
          <button
            onClick={handleCreateVirtualCardDirect}
            type="button"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            Provision Dynamic Virtual Card
          </button>
        </div>
      )}

      {/* Card Info Details Section */}
      {activeCard && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block">Card Telemetrics</span>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400 block uppercase text-[9px]">Holder Name</span>
              <span className="font-bold text-white">{user.firstName} {user.lastName}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase text-[9px]">Card Status</span>
              <span className={`font-bold uppercase ${activeCard.status === "Active" ? "text-emerald-400" : "text-amber-400"}`}>
                {activeCard.status}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase text-[9px]">Daily Spending Limit</span>
              <span className="font-bold text-white">${activeCard.dailyLimit.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase text-[9px]">Spent Today</span>
              <span className="font-bold text-red-400">${(activeCard.spentToday || 0).toFixed(2)}</span>
            </div>
            {activeTab === "Credit Card" && (
              <div className="col-span-2 border-t border-white/5 pt-2 flex justify-between">
                <div>
                  <span className="text-gray-400 block uppercase text-[9px]">Available Credit</span>
                  <span className="text-emerald-400 font-bold">${(activeCard.dailyLimit - (activeCard.spentToday || 0)).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase text-[9px]">Total Credit Line</span>
                  <span className="text-white font-bold">${activeCard.dailyLimit.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Management Options List */}
      {activeCard && (
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block">Card Controls</span>
          <div className="space-y-2">
            {/* View Card details (requires auth) */}
            <button
              onClick={() => triggerSecurity("REVEAL_DETAILS")}
              className="w-full p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">View Card Details</div>
                  <div className="text-[9px] text-gray-400">Reveal card number, CVV, and expiration securely</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Freeze / Unfreeze Card */}
            <button
              onClick={() => triggerSecurity("FREEZE_TOGGLE")}
              className="w-full p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${activeCard.status === "Active" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"} rounded-lg flex items-center justify-center`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{activeCard.status === "Active" ? "Freeze Card" : "Unfreeze Card"}</div>
                  <div className="text-[9px] text-gray-400">Instantly lock or restore payment abilities</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Change Card PIN */}
            <button
              onClick={() => triggerSecurity("PROMPT_CHANGE_PIN")}
              className="w-full p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Change Card PIN</div>
                  <div className="text-[9px] text-gray-400">Update security PIN for ATM and retail terminals</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Change Spending Limit */}
            <button
              onClick={() => triggerSecurity("PROMPT_CHANGE_LIMIT")}
              className="w-full p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Change Spending Limit</div>
                  <div className="text-[9px] text-gray-400">Configure daily transaction ceiling levels</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Lock Online Transactions */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lock Online Transactions</div>
                  <div className="text-[9px] text-gray-400">Restrict e-commerce payments completely</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={activeCard.onlineLocked || false}
                onChange={() => handleToggleLockPreference("onlineLocked")}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Lock ATM Withdrawals */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lock ATM Withdrawals</div>
                  <div className="text-[9px] text-gray-400">Prevent cash disbursements at ATMs</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={activeCard.atmLocked || false}
                onChange={() => handleToggleLockPreference("atmLocked")}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Lock International Transactions */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lock International Transactions</div>
                  <div className="text-[9px] text-gray-400">Decline charges generated outside home region</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={activeCard.intlLocked || false}
                onChange={() => handleToggleLockPreference("intlLocked")}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Replace Lost Card */}
            <button
              onClick={() => triggerSecurity("REPLACE_LOST")}
              className="w-full p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center text-rose-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Replace Lost Card</div>
                  <div className="text-[9px] text-gray-400">Issue new card credentials, disables current card</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Report Stolen Card */}
            <button
              onClick={() => triggerSecurity("REPORT_STOLEN")}
              className="w-full p-4 bg-white/5 border border-white/5 hover:Rose-500/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left border-rose-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-400">Report Stolen Card</div>
                  <div className="text-[9px] text-red-500/70">Permanently terminate and block card line</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Download Card Statement */}
            <button
              onClick={handleDownloadStatement}
              className="w-full p-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500/10 border border-gray-500/20 rounded-lg flex items-center justify-center text-gray-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Download Card Statement</div>
                  <div className="text-[9px] text-gray-400">Generate statements and recent ledger pdf reports</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* SECURITY / PASSCODE / BIOMETRIC CONFIRMATION OVERLAY MODAL */}
      <AnimatePresence>
        {securityModal.isOpen && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-[#071B34] border border-white/10 rounded-3xl p-6 shadow-2xl text-left space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/15 border border-blue-500 flex items-center justify-center mx-auto text-blue-400">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {securityModal.action === "REVEAL_DETAILS" && "Authorize to show card credential numbers & CVV."}
                  {securityModal.action === "FREEZE_TOGGLE" && "Confirm toggle payment card state."}
                  {securityModal.action === "PROMPT_CHANGE_PIN" && "Set and confirm card ATM Security PIN."}
                  {securityModal.action === "PROMPT_CHANGE_LIMIT" && "Input new daily spending ceiling cap."}
                  {securityModal.action === "REPLACE_LOST" && "Replacing this card terminates current physical token."}
                  {securityModal.action === "REPORT_STOLEN" && "Confirm stolen report. Permanent termination."}
                  {securityModal.action === "PROVISION_VIRTUAL" && "Confirm provisioning new digital multi-use virtual card."}
                </p>
              </div>

              {/* Action specific subforms inside modal */}
              {securityModal.action === "PROMPT_CHANGE_PIN" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase">Input New 4-Digit ATM PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center font-mono text-xl tracking-[1em] text-white focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newPinInput.length !== 4) {
                        setSecurityModal(prev => ({ ...prev, error: "PIN must be exactly 4 digits." }));
                        return;
                      }
                      setSecurityModal(prev => ({
                        ...prev,
                        action: "CHANGE_PIN",
                        payload: { pin: newPinInput }
                      }));
                      setNewPinInput("");
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                  >
                    Confirm PIN Change
                  </button>
                </div>
              )}

              {securityModal.action === "PROMPT_CHANGE_LIMIT" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase">Input Daily Transaction Limit ($)</label>
                  <input
                    type="number"
                    value={limitInput}
                    onChange={e => setLimitInput(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const lim = parseFloat(limitInput);
                      if (isNaN(lim) || lim <= 0) {
                        setSecurityModal(prev => ({ ...prev, error: "Please enter a valid positive number." }));
                        return;
                      }
                      setSecurityModal(prev => ({
                        ...prev,
                        action: "CHANGE_LIMIT",
                        payload: { limit: lim }
                      }));
                      setLimitInput("");
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                  >
                    Confirm Limit Change
                  </button>
                </div>
              )}

              {/* standard passcode PIN confirmation */}
              {securityModal.action !== "PROMPT_CHANGE_PIN" && securityModal.action !== "PROMPT_CHANGE_LIMIT" && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase text-center mb-1.5">Enter Transaction PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center font-mono text-lg tracking-[1.2em] text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSecuritySuccess("BIOMETRIC")}
                      className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V5a3 3 0 00-6 0v6a14.92 14.92 0 002.535 8.23l.115.185m12.355-12.355A11.962 11.962 0 0016 12v3a3 3 0 003 3h.25a3 3 0 003-3v-3a13.963 13.963 0 00-2.355-7.645m-4.29 11.23a11.963 11.963 0 002.29-6.08V11a5 5 0 00-10 0v1.5" />
                      </svg>
                      <span>Face ID</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSecuritySuccess("BIOMETRIC")}
                      className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V5a3 3 0 00-6 0v6a14.92 14.92 0 002.535 8.23l.115.185m12.355-12.355A11.962 11.962 0 0016 12v3a3 3 0 003 3h.25a3 3 0 003-3v-3a13.963 13.963 0 00-2.355-7.645m-4.29 11.23a11.963 11.963 0 002.29-6.08V11a5 5 0 00-10 0v1.5" />
                      </svg>
                      <span>Touch ID</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleSecuritySuccess("PIN")}
                    className="w-full py-3 bg-[#2563EB] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg"
                  >
                    Confirm PIN Authorization
                  </button>
                </div>
              )}

              {securityModal.error && (
                <div className="text-[10px] text-red-400 font-mono text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                  {securityModal.error}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSecurityModal({ isOpen: false, action: "" })}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 font-semibold text-xs rounded-xl"
              >
                Cancel Action
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 6. TRANSACTION HISTORY STATEMENT (Search / Filter)
// =============================================================
function HistoryView({ transactions, syncDB, setActiveView }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("ALL"); // ALL, TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, LAST_MONTH, CUSTOM
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, DEPOSITS, WITHDRAWALS, TRANSFERS, BILLS
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(10);

  // Filter & Search Logic
  const filteredTransactions = transactions.filter((t: any) => {
    // 1. Search Query Match
    const matchQuery = 
      (t.merchant || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.referenceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.amount || "").toString().includes(searchQuery) ||
      new Date(t.date).toLocaleDateString().includes(searchQuery);

    if (!matchQuery) return false;

    // 2. Type Filter Match
    if (typeFilter !== "ALL") {
      const isDeposit = t.amount > 0;
      if (typeFilter === "DEPOSITS" && !isDeposit) return false;
      if (typeFilter === "WITHDRAWALS" && isDeposit) return false;
      if (typeFilter === "TRANSFERS" && t.category !== "Transfer") return false;
      if (typeFilter === "BILLS" && t.category !== "Utilities & Bills") return false;
    }

    // 3. Time Filter Match
    if (timeFilter !== "ALL") {
      const txDate = new Date(t.date);
      const now = new Date();
      
      // Start of periods
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      
      const startOfWeek = new Date(todayStart);
      startOfWeek.setDate(startOfWeek.getDate() - now.getDay());

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      if (timeFilter === "TODAY" && txDate < todayStart) return false;
      if (timeFilter === "YESTERDAY" && (txDate < yesterdayStart || txDate >= todayStart)) return false;
      if (timeFilter === "THIS_WEEK" && txDate < startOfWeek) return false;
      if (timeFilter === "THIS_MONTH" && txDate < startOfMonth) return false;
      if (timeFilter === "LAST_MONTH" && (txDate < startOfLastMonth || txDate > endOfLastMonth)) return false;
      
      if (timeFilter === "CUSTOM") {
        if (customStartDate && txDate < new Date(customStartDate)) return false;
        // Include full end day
        if (customEndDate) {
          const endLimit = new Date(customEndDate);
          endLimit.setHours(23, 59, 59, 999);
          if (txDate > endLimit) return false;
        }
      }
    }

    return true;
  });

  // Sort by date descending
  const sortedTransactions = [...filteredTransactions].sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const paginatedTransactions = sortedTransactions.slice(0, visibleCount);

  // Helper: map categories to stylish icon circles
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "Salary":
        return { bg: "bg-emerald-500/15 border-emerald-500/25", text: "text-emerald-400", symbol: "$" };
      case "Food & Dining":
        return { bg: "bg-amber-500/15 border-amber-500/25", text: "text-amber-400", symbol: "🍴" };
      case "Shopping":
        return { bg: "bg-purple-500/15 border-purple-500/25", text: "text-purple-400", symbol: "🛍️" };
      case "Travel & Transit":
        return { bg: "bg-blue-500/15 border-blue-500/25", text: "text-blue-400", symbol: "✈️" };
      case "Utilities & Bills":
        return { bg: "bg-orange-500/15 border-orange-500/25", text: "text-orange-400", symbol: "⚡" };
      case "Investment":
        return { bg: "bg-indigo-500/15 border-indigo-500/25", text: "text-indigo-400", symbol: "📈" };
      case "Transfer":
        return { bg: "bg-cyan-500/15 border-cyan-500/25", text: "text-cyan-400", symbol: "⇄" };
      case "Loan":
        return { bg: "bg-rose-500/15 border-rose-500/25", text: "text-rose-400", symbol: "🏦" };
      default:
        return { bg: "bg-gray-500/15 border-gray-500/25", text: "text-gray-400", symbol: "•" };
    }
  };

  const handleDownloadReceipt = (tx: any) => {
    alert(`[RECEIPT DOWNLOADED] Tax Invoice Statement PDF for reference ${tx.referenceNumber} downloaded successfully.`);
  };

  const handleShareReceipt = (tx: any) => {
    alert(`[RECEIPT SHARED] Receipt link for reference ${tx.referenceNumber} copied to clipboard!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveView("home")}
          type="button"
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Transactions</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          type="button"
          className={`p-2.5 rounded-xl border transition-all ${showFilters ? "bg-[#2563EB]/15 border-[#2563EB]/40 text-blue-400" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setVisibleCount(10); // reset page count on search
          }}
          placeholder="Search merchants, categories, amount or ID..."
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:border-[#2563EB] focus:outline-none transition-colors"
        />
      </div>

      {/* Advanced Filtering Accordion Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Time Filter */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Date Window</label>
              <select
                value={timeFilter}
                onChange={e => {
                  setTimeFilter(e.target.value);
                  setVisibleCount(10);
                }}
                className="w-full bg-[#071C3F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All History</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="THIS_WEEK">This Week</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="CUSTOM">Custom Range...</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Transaction Type</label>
              <select
                value={typeFilter}
                onChange={e => {
                  setTypeFilter(e.target.value);
                  setVisibleCount(10);
                }}
                className="w-full bg-[#071C3F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="DEPOSITS">Money In (Deposits)</option>
                <option value="WITHDRAWALS">Money Out (Spending)</option>
                <option value="TRANSFERS">Account Transfers</option>
                <option value="BILLS">Utilities & Bills</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range Controls */}
          {timeFilter === "CUSTOM" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3"
            >
              <div>
                <label className="block text-[8px] font-mono text-gray-400 uppercase">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => {
                    setCustomStartDate(e.target.value);
                    setVisibleCount(10);
                  }}
                  className="w-full mt-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono text-gray-400 uppercase">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => {
                    setCustomEndDate(e.target.value);
                    setVisibleCount(10);
                  }}
                  className="w-full mt-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {/* Quick Clear Filter Option */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setTimeFilter("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
                setCustomStartDate("");
                setCustomEndDate("");
              }}
              className="text-[10px] font-mono font-bold text-blue-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Transaction List */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase font-bold">Ledger Logs</span>
          <span className="text-[10px] font-mono text-gray-400">Showing {Math.min(paginatedTransactions.length, sortedTransactions.length)} of {sortedTransactions.length}</span>
        </div>

        <div className="space-y-2">
          {paginatedTransactions.map((t: any, idx: number) => {
            const theme = getCategoryTheme(t.category);
            const isExpense = t.amount < 0;
            const txDate = new Date(t.date);

            return (
              <motion.div
                key={t.id || idx}
                onClick={() => setSelectedTx(t)}
                whileHover={{ x: 2 }}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/10 cursor-pointer transition-all text-left"
              >
                <div className="flex items-center gap-3.5">
                  {/* Category Circle Logo/Avatar */}
                  <div className={`w-11 h-11 rounded-xl ${theme.bg} border ${theme.text} flex items-center justify-center font-bold text-lg select-none`}>
                    {theme.symbol}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white line-clamp-1">{t.merchant}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-mono">
                      <span>{t.category}</span>
                      <span>•</span>
                      <span>{txDate.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end">
                  <div className={`text-xs font-mono font-bold ${isExpense ? "text-rose-400" : "text-emerald-400"}`}>
                    {isExpense ? "-" : "+"}${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded mt-1.5 leading-none ${
                    t.status === "Completed" || !t.status
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : t.status === "Pending"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {(t.status || "Completed").toUpperCase()}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {sortedTransactions.length === 0 && (
            <div className="text-center py-12 bg-white/5 border border-white/5 rounded-3xl space-y-2">
              <p className="text-xs text-gray-500">No transactions match your search parameters.</p>
              <button
                onClick={() => {
                  setTimeFilter("ALL");
                  setTypeFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-xs font-mono text-blue-400 underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Load More Pagination Trigger */}
          {sortedTransactions.length > visibleCount && (
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 transition-colors"
            >
              Load More Activity
            </button>
          )}
        </div>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-sm bg-[#071C33] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white tracking-wide">Transaction Receipt</h3>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {/* Top Amount visual */}
              <div className="text-center space-y-1 py-1">
                <div className={`text-2xl font-mono font-black ${selectedTx.amount < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {selectedTx.amount < 0 ? "-" : "+"}${Math.abs(selectedTx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-semibold text-white">{selectedTx.merchant}</div>
                <div className="text-[10px] text-gray-400">{selectedTx.category}</div>
              </div>

              {/* Details table */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-mono space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">TRANSACTION ID:</span>
                  <span className="font-bold text-white">{selectedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">REFERENCE NO:</span>
                  <span className="font-bold text-white">{selectedTx.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">STATUS:</span>
                  <span className={`font-bold ${selectedTx.amount < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {selectedTx.status || "Completed"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span className="text-gray-400">DATE:</span>
                  <span className="font-bold text-white">{new Date(selectedTx.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TIME:</span>
                  <span className="font-bold text-white">
                    {new Date(selectedTx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span className="text-gray-400">SENDER:</span>
                  <span className="font-bold text-white">{selectedTx.amount < 0 ? "You (Alex Johnson)" : selectedTx.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RECEIVER:</span>
                  <span className="font-bold text-white">{selectedTx.amount < 0 ? selectedTx.merchant : "You (Alex Johnson)"}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span className="text-gray-400">PLATFORM FEE:</span>
                  <span className="font-bold text-white">$0.00 (Free)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">EST. TAX (GST):</span>
                  <span className="font-bold text-white">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span className="text-gray-400">PAYMENT METHOD:</span>
                  <span className="font-bold text-white">Aurora Account Line</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(selectedTx)}
                  className="w-full py-3 bg-[#2563EB] hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareReceipt(selectedTx)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>Share Receipt Receipt</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 7. LOANS (Details & Smart application panel)
// =============================================================
function LoansView({ loans, triggerNotification, syncDB, user, setActiveView }: any) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [error, setError] = useState("");
  
  // Application Form State
  const [appFullName, setAppFullName] = useState(`${user.firstName} ${user.lastName}`);
  const [appEmployment, setAppEmployment] = useState("Employed");
  const [appEmployer, setAppEmployer] = useState(user.employment || "");
  const [appIncome, setAppIncome] = useState("");
  const [appAmount, setAppAmount] = useState("");
  const [appPurpose, setAppPurpose] = useState("");
  const [appPeriod, setAppPeriod] = useState("36");

  // File Upload states
  const [files, setFiles] = useState<{
    bankStatement: File | null;
    idDoc: File | null;
    employmentLetter: File | null;
  }>({ bankStatement: null, idDoc: null, employmentLetter: null });

  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({
    bankStatement: false,
    idDoc: false,
    employmentLetter: false
  });

  const products = [
    { 
      type: "Personal Loan", 
      rate: 4.8, 
      max: 50000, 
      icon: "👤", 
      desc: "Flexible, unsecured funding designed to help you meet personal expenses, consolidate debts, or manage unexpected costs.",
      eligibility: "Minimum monthly income: $3,000. Excellent credit history required.",
      calculation: "Flat interest calculation over specified term with equal monthly amortizations."
    },
    { 
      type: "Mortgage Loan", 
      rate: 3.2, 
      max: 1000000, 
      icon: "🏡", 
      desc: "Long-term home financing programs with premium low rates and structured repayment terms up to 30 years.",
      eligibility: "Minimum monthly income: $6,000. Clean property appraisal documentation.",
      calculation: "Amortized monthly interest with annual asset appraisal reviews."
    },
    { 
      type: "Business Loan", 
      rate: 5.5, 
      max: 2000000, 
      icon: "💼", 
      desc: "Capital injection programs tailored for business acquisition, equipment purchase, expansion, or general cash flow liquidity.",
      eligibility: "Active company registered for 2+ years. Audited corporate bank accounts.",
      calculation: "Principal and interest amortizations with options for quarterly balloon payments."
    },
    { 
      type: "Auto Loan", 
      rate: 3.9, 
      max: 100000, 
      icon: "🚗", 
      desc: "Rapid vehicle acquisition financing supporting new and pre-owned automobiles, with flexible terms and low deposits.",
      eligibility: "Minimum monthly income: $2,500. Insured collateral assignment.",
      calculation: "Vehicle lien collateralized interest amortizations."
    },
    { 
      type: "Education Loan", 
      rate: 2.8, 
      max: 150000, 
      icon: "🎓", 
      desc: "Subsidized low-interest student financing covering tuition fees, academic materials, boarding, and international study expenses.",
      eligibility: "Enrolled in an accredited educational institution with guarantor co-signer.",
      calculation: "Grace periods active during study. Amortization starts post-graduation."
    },
    { 
      type: "Emergency Loan", 
      rate: 6.5, 
      max: 10000, 
      icon: "🚨", 
      desc: "Urgent liquidity program featuring near-instant approval turnarounds to handle medical crises, repairs, or immediate distress.",
      eligibility: "Aurora Bank active account holder for 6+ months with consistent direct deposits.",
      calculation: "Interest computed on daily balances, payable monthly over tight short terms."
    },
    { 
      type: "Home Improvement Loan", 
      rate: 4.2, 
      max: 75000, 
      icon: "🛠️", 
      desc: "Enhance your real estate asset value through home remodeling, solar retrofitting, roofing, or extensions.",
      eligibility: "Minimum monthly income: $3,500. Ownership deed verification.",
      calculation: "Fixed-rate amortization with escrow construction milestones release."
    },
    { 
      type: "Agricultural Loan", 
      rate: 3.5, 
      max: 500000, 
      icon: "🌾", 
      desc: "Dedicated agricultural development financing supporting crop cycles, livestock purchases, tractor leasing, and farming equipment.",
      eligibility: "Registered agricultural farm enterprise or land tenancy contract.",
      calculation: "Custom crop-harvest aligned seasonal repayment schedules available."
    }
  ];

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent, key: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [key]: active }));
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [key]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFiles(prev => ({ ...prev, [key]: droppedFile }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFiles(prev => ({ ...prev, [key]: selectedFile }));
    }
  };

  // Monthly installment estimation
  const getInstallmentEstimate = (amountVal: number, rate: number, months: number) => {
    if (isNaN(amountVal) || amountVal <= 0 || isNaN(months) || months <= 0) return 0;
    const totalRepay = amountVal * (1 + (rate / 100));
    return parseFloat((totalRepay / months).toFixed(2));
  };

  const handleOpenApply = (product: any) => {
    setSelectedProduct(product);
    setAppAmount(String(Math.min(product.max / 2, 25000)));
    setShowApplyForm(true);
    setError("");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const requestedAmount = parseFloat(appAmount);
    const monthlyIncome = parseFloat(appIncome);
    const months = parseInt(appPeriod);

    if (!appFullName) {
      setError("Please input your full legal name.");
      return;
    }
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setError("Please input a valid positive loan principal amount.");
      return;
    }
    if (requestedAmount > selectedProduct.max) {
      setError(`Maximum principal ceiling for ${selectedProduct.type} is $${selectedProduct.max.toLocaleString()}.`);
      return;
    }
    if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
      setError("Please input your regular monthly income.");
      return;
    }

    // Eligibility check: monthly installment must not exceed 40% of monthly income
    const monthlyInstallment = getInstallmentEstimate(requestedAmount, selectedProduct.rate, months);
    const maxInstallmentCeiling = monthlyIncome * 0.40;

    if (monthlyInstallment > maxInstallmentCeiling) {
      setError(`Application Rejected: Estimated monthly repayment of $${monthlyInstallment.toLocaleString()} exceeds our financial safety threshold (40% of your declared $${monthlyIncome.toLocaleString()} monthly income). Please request a lower principal or extend the repayment duration.`);
      return;
    }

    // Check files are uploaded
    if (!files.bankStatement || !files.idDoc) {
      setError("Compliance Notice: Bank Statement and Government ID documents are mandatory for regulatory audit. Please attach files.");
      return;
    }

    // Proceed with registration
    const newLoan: any = {
      id: `LOAN-${Math.floor(1000 + Math.random() * 8999)}`,
      userId: user.id,
      type: selectedProduct.type,
      amount: requestedAmount,
      interestRate: selectedProduct.rate,
      repaymentPeriod: months,
      monthlyInstallment: monthlyInstallment,
      status: "Pending Approval",
      appliedDate: new Date().toISOString(),
      documents: [
        { name: files.bankStatement.name, url: "#" },
        { name: files.idDoc.name, url: "#" }
      ]
    };

    if (files.employmentLetter) {
      newLoan.documents.push({ name: files.employmentLetter.name, url: "#" });
    }

    await AuroraDB.saveLoan(newLoan);

    triggerNotification(
      "Loan Application Registered",
      `Your request for a $${requestedAmount.toLocaleString()} ${selectedProduct.type} is currently under underwriting review.`,
      "Transaction"
    );

    alert(`[APPLICATION SUCCESS] Your loan application has been registered securely. Our underwriting team will complete compliance checks within 24 business hours.`);
    
    // Reset Form
    setShowApplyForm(false);
    setSelectedProduct(null);
    setAppIncome("");
    setAppPurpose("");
    setFiles({ bankStatement: null, idDoc: null, employmentLetter: null });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveView("home")}
          type="button"
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Our Loan Products</h2>
        <div className="w-16" />
      </div>

      {/* Active Loans Section */}
      {loans.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Active Facilities</span>
          <div className="space-y-2">
            {loans.map((l: any, i: number) => {
              const totalRepay = l.amount * (1 + (l.interestRate / 100));
              return (
                <div
                  key={l.id || i}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{l.type}</span>
                      <span className="text-[10px] font-mono text-gray-400">({l.id})</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Principal: <span className="text-white font-bold">${l.amount.toLocaleString()}</span> at <span className="text-white font-bold">{l.interestRate}% APR</span>
                    </div>
                    <div className="text-[10px] text-[#D8A63D] font-mono">
                      Monthly Payment: ${l.monthlyInstallment.toLocaleString()} for {l.repaymentPeriod} mo
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                    l.status === "Approved" 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                      : l.status === "Rejected" 
                      ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  }`}>
                    {l.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loan Offerings Grid */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Available Loan Products</span>
        <div className="grid grid-cols-1 gap-3">
          {products.map((p, idx) => {
            const defaultInstallment = getInstallmentEstimate(p.max / 2, p.rate, 36);
            return (
              <div
                key={idx}
                className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{p.type}</h4>
                      <p className="text-[10px] text-[#D8A63D] font-mono mt-0.5">{p.rate}% APR • Fixed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-gray-400 uppercase">Principal Cap</span>
                    <div className="text-xs text-white font-black">${p.max.toLocaleString()}</div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed text-left">{p.desc}</p>

                <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] font-mono">
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px]">EST. PAYMENT</span>
                    <span className="text-white font-bold">${defaultInstallment.toLocaleString()}/mo</span>
                    <span className="text-gray-500 text-[8px] ml-1">for {(p.max/2).toLocaleString()} over 36mo</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      type="button"
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:bg-white/10 text-gray-300"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenApply(p)}
                      type="button"
                      className="px-3 py-1.5 bg-[#2563EB] hover:brightness-110 text-white rounded-xl text-[10px] font-bold shadow-md"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOAN DETAILS MODAL */}
      <AnimatePresence>
        {selectedProduct && !showApplyForm && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#071C33] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedProduct.icon}</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">{selectedProduct.type}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-mono text-[#D8A63D] block uppercase font-bold">PROGRAM DESCRIPTION</span>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1">{selectedProduct.desc}</p>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-[#D8A63D] block uppercase font-bold">COMPLIANCE ELIGIBILITY</span>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1">{selectedProduct.eligibility}</p>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-[#D8A63D] block uppercase font-bold">REPAYMENT STRUCTURE</span>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1">{selectedProduct.calculation}</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ANNUAL INTEREST RATE:</span>
                    <span className="font-bold text-emerald-400">{selectedProduct.rate}% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MAX PRINCIPAL AMOUNT:</span>
                    <span className="font-bold text-white">${selectedProduct.max.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">REQUIRED DOCUMENTS:</span>
                    <span className="font-bold text-white">Bank Statement, ID Copy</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenApply(selectedProduct)}
                  className="w-full py-2.5 bg-[#2563EB] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Fill Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOAN APPLICATION FORM MODAL */}
      <AnimatePresence>
        {showApplyForm && selectedProduct && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-md bg-[#071C33] border border-white/10 rounded-3xl p-6 shadow-2xl my-8 space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedProduct.icon}</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Apply: {selectedProduct.type}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyForm(false);
                    setFiles({ bankStatement: null, idDoc: null, employmentLetter: null });
                  }}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase tracking-wider">FULL LEGAL NAME</label>
                  <input
                    type="text"
                    required
                    value={appFullName}
                    onChange={e => setAppFullName(e.target.value)}
                    placeholder="Enter your full name as on government ID"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>

                {/* Income and Employment Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">EMPLOYMENT STATE</label>
                    <select
                      value={appEmployment}
                      onChange={e => setAppEmployment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white focus:outline-none"
                    >
                      <option value="Employed">Employed</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">EMPLOYER NAME</label>
                    <input
                      type="text"
                      value={appEmployer}
                      onChange={e => setAppEmployer(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Monthly Income & Loan Purpose */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">MONTHLY INCOME ($)</label>
                    <input
                      type="number"
                      required
                      value={appIncome}
                      onChange={e => setAppIncome(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">LOAN PURPOSE</label>
                    <input
                      type="text"
                      required
                      value={appPurpose}
                      onChange={e => setAppPurpose(e.target.value)}
                      placeholder="e.g. Buying Car"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Loan Amount & Term Grid */}
                <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div>
                    <label className="block text-[10px] font-mono text-[#D8A63D] mb-1.5 uppercase font-bold">LOAN AMOUNT (USD)</label>
                    <input
                      type="number"
                      required
                      value={appAmount}
                      onChange={e => setAppAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none font-bold text-sm"
                    />
                    <span className="text-[8px] text-gray-400 mt-1 block">Max: ${selectedProduct.max.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#D8A63D] mb-1.5 uppercase font-bold">TERM DURATION</label>
                    <select
                      value={appPeriod}
                      onChange={e => setAppPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white focus:outline-none font-bold"
                    >
                      <option value="12">12 Months (1 Year)</option>
                      <option value="24">24 Months (2 Years)</option>
                      <option value="36">36 Months (3 Years)</option>
                      <option value="60">60 Months (5 Years)</option>
                      <option value="120">120 Months (10 Years)</option>
                      {selectedProduct.type === "Mortgage Loan" && (
                        <option value="360">360 Months (30 Years)</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Repayment Estimation Preview widget */}
                <div className="bg-[#2563EB]/10 border border-[#2563EB]/25 rounded-2xl p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-blue-400 block uppercase">Estimated Monthly Installment</span>
                    <span className="text-lg font-mono font-bold text-white">
                      ${getInstallmentEstimate(parseFloat(appAmount), selectedProduct.rate, parseInt(appPeriod)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-gray-400 block uppercase">REPAYMENT APR</span>
                    <span className="text-emerald-400 font-bold font-mono">{selectedProduct.rate}% APR</span>
                  </div>
                </div>

                {/* FILE UPLOADS WITH DRAG AND DROP & SELECTION */}
                <div className="space-y-3.5 pt-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Supporting Documents (Mandatory)</span>

                  {/* 1. Bank Statement */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-mono uppercase block">3-Months Bank Statement</span>
                    <div
                      onDragEnter={(e) => handleDrag(e, "bankStatement", true)}
                      onDragOver={(e) => handleDrag(e, "bankStatement", true)}
                      onDragLeave={(e) => handleDrag(e, "bankStatement", false)}
                      onDrop={(e) => handleDrop(e, "bankStatement")}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[70px] ${
                        dragActive.bankStatement 
                          ? "border-blue-500 bg-blue-500/10" 
                          : files.bankStatement 
                          ? "border-emerald-500/50 bg-emerald-500/5" 
                          : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => document.getElementById("bankStatement_picker")?.click()}
                    >
                      <input
                        type="file"
                        id="bankStatement_picker"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, "bankStatement")}
                      />
                      {files.bankStatement ? (
                        <span className="text-emerald-400 font-semibold truncate max-w-xs block">
                          ✓ {files.bankStatement.name}
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-gray-300">Drag & Drop or Click to Select</p>
                          <p className="text-[8px] text-gray-500">PDF, PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Government ID */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-mono uppercase block">Government Issued Photo ID</span>
                    <div
                      onDragEnter={(e) => handleDrag(e, "idDoc", true)}
                      onDragOver={(e) => handleDrag(e, "idDoc", true)}
                      onDragLeave={(e) => handleDrag(e, "idDoc", false)}
                      onDrop={(e) => handleDrop(e, "idDoc")}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[70px] ${
                        dragActive.idDoc 
                          ? "border-blue-500 bg-blue-500/10" 
                          : files.idDoc 
                          ? "border-emerald-500/50 bg-emerald-500/5" 
                          : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => document.getElementById("idDoc_picker")?.click()}
                    >
                      <input
                        type="file"
                        id="idDoc_picker"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, "idDoc")}
                      />
                      {files.idDoc ? (
                        <span className="text-emerald-400 font-semibold truncate max-w-xs block">
                          ✓ {files.idDoc.name}
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-gray-300">Drag & Drop or Click to Select</p>
                          <p className="text-[8px] text-gray-500">Passport, Driving License</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Employment Letter */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-mono uppercase block">Employment/Offer Letter (Optional)</span>
                    <div
                      onDragEnter={(e) => handleDrag(e, "employmentLetter", true)}
                      onDragOver={(e) => handleDrag(e, "employmentLetter", true)}
                      onDragLeave={(e) => handleDrag(e, "employmentLetter", false)}
                      onDrop={(e) => handleDrop(e, "employmentLetter")}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[70px] ${
                        dragActive.employmentLetter 
                          ? "border-blue-500 bg-blue-500/10" 
                          : files.employmentLetter 
                          ? "border-emerald-500/50 bg-emerald-500/5" 
                          : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => document.getElementById("employmentLetter_picker")?.click()}
                    >
                      <input
                        type="file"
                        id="employmentLetter_picker"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, "employmentLetter")}
                      />
                      {files.employmentLetter ? (
                        <span className="text-emerald-400 font-semibold truncate max-w-xs block">
                          ✓ {files.employmentLetter.name}
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-gray-300">Drag & Drop or Click to Select</p>
                          <p className="text-[8px] text-gray-500">Letterhead contract verification</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-[10px] text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg leading-relaxed">
                    {error}
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyForm(false);
                      setFiles({ bankStatement: null, idDoc: null, employmentLetter: null });
                    }}
                    className="py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-3 bg-[#2563EB] hover:brightness-110 text-white font-bold rounded-xl shadow-lg"
                  >
                    Submit Underwriting
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 8. INVESTMENTS PORTFOLIO (Interactive graph, buy/sell)
// =============================================================
function InvestmentsView({ investments, accounts, triggerNotification, syncDB, user, setActiveView }: any) {
  const [activeRange, setActiveRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1M");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [tradeType, setTradeType] = useState<"Buy" | "Sell" | "Transfer">("Buy");
  const [tradeSymbol, setTradeSymbol] = useState("AAPL");
  const [tradeQty, setTradeQty] = useState("");
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [error, setError] = useState("");

  const categories = [
    "All Categories",
    "Stocks",
    "Mutual Funds",
    "Government Bonds",
    "Treasury Bills",
    "Fixed Deposits",
    "Cryptocurrency",
    "Retirement Savings",
    "Foreign Exchange"
  ];

  const marketAssets = [
    { name: "Apple Inc.", symbol: "AAPL", price: 189.43, category: "Stocks", change: 1.25, purchaseDate: "2024-03-12" },
    { name: "NVIDIA Corp.", symbol: "NVDA", price: 485.20, category: "Stocks", change: 4.82, purchaseDate: "2024-05-20" },
    { name: "Tesla Motors", symbol: "TSLA", price: 178.50, category: "Stocks", change: -2.15, purchaseDate: "2024-06-01" },
    { name: "Vanguard S&P 500", symbol: "VOO", price: 442.10, category: "Mutual Funds", change: 0.58, purchaseDate: "2024-02-14" },
    { name: "US 10-Year Bond", symbol: "US10Y", price: 98.45, category: "Government Bonds", change: 0.05, purchaseDate: "2024-01-10" },
    { name: "Treasury Bill 3M", symbol: "T-BILL", price: 95.12, category: "Treasury Bills", change: 0.02, purchaseDate: "2024-04-01" },
    { name: "Bitcoin Core", symbol: "BTC", price: 62450.00, category: "Cryptocurrency", change: 3.42, purchaseDate: "2024-06-18" },
    { name: "Aurora Retirement Pool", symbol: "ARP", price: 1.24, category: "Retirement Savings", change: 0.18, purchaseDate: "2024-01-01" },
    { name: "Euro / US Dollar", symbol: "EURUSD", price: 1.08, category: "Foreign Exchange", change: -0.12, purchaseDate: "2024-06-25" }
  ];

  const activeCategoryAssets = selectedCategory === "All Categories" 
    ? marketAssets 
    : marketAssets.filter(a => a.category === selectedCategory);

  const selectedAsset = marketAssets.find(a => a.symbol === tradeSymbol) || marketAssets[0];

  // Portfolio calculations
  const portfolioValue = investments.reduce((sum: number, i: any) => sum + i.currentValue, 0);
  const totalCostBasis = investments.reduce((sum: number, i: any) => sum + i.investedAmount, 0);
  const totalGainLoss = portfolioValue - totalCostBasis;
  const totalGainLossPercentage = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Bezier coordinates maps for multi-timeline SVG rendering
  const chartsData: { [key: string]: { points: number[]; returnStr: string; gainVal: string } } = {
    "1D": { points: [21400, 21510, 21450, 21580, 21620, 21670], returnStr: "+1.24%", gainVal: "+$245.80" },
    "1W": { points: [21100, 21300, 21250, 21450, 21560, 21670], returnStr: "+2.70%", gainVal: "+$569.10" },
    "1M": { points: [20100, 20800, 20750, 21200, 21450, 21670], returnStr: "+7.81%", gainVal: "+$1,570.00" },
    "3M": { points: [18900, 19600, 19500, 20400, 21100, 21670], returnStr: "+14.65%", gainVal: "+$2,770.00" },
    "1Y": { points: [16500, 17800, 18100, 19400, 20850, 21670], returnStr: "+31.33%", gainVal: "+$5,170.00" },
    ALL: { points: [12000, 14500, 16800, 18900, 20300, 21670], returnStr: "+80.58%", gainVal: "+$9,670.00" }
  };

  const getSvgCoordinates = () => {
    const coords = chartsData[activeRange]?.points || chartsData["1M"].points;
    const width = 300;
    const height = 100;
    const maxVal = Math.max(...coords) * 1.05;
    const minVal = Math.min(...coords) * 0.95;

    return coords.map((val, idx) => {
      const x = (idx / (coords.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal)) * height;
      return `${x},${y}`;
    }).join(" ");
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const quantity = parseFloat(tradeQty);
    if (isNaN(quantity) || quantity <= 0) {
      setError("Please enter a valid positive asset quantity.");
      return;
    }

    const state = AuroraDB.getState();
    // Default to funding from Checking Account
    const sourceAcc = state.accounts.find((a: any) => a.type === "Checking Account");
    if (!sourceAcc) {
      setError("Core checking account line not found.");
      return;
    }

    const totalCost = selectedAsset.price * quantity;

    if (tradeType === "Buy") {
      if (sourceAcc.balance < totalCost) {
        setError("Error: Insufficient Checking Account funds to complete transaction.");
        return;
      }

      const updatedSourceAcc = {
        ...sourceAcc,
        balance: sourceAcc.balance - totalCost
      };
      await AuroraDB.saveAccount(updatedSourceAcc);

      const dbAsset = state.investments.find((i: any) => i.symbol === tradeSymbol && i.userId === sourceAcc.userId);
      if (dbAsset) {
        const updatedAsset = {
          ...dbAsset,
          quantity: dbAsset.quantity + quantity,
          investedAmount: dbAsset.investedAmount + totalCost,
          currentValue: (dbAsset.quantity + quantity) * selectedAsset.price,
          lastUpdated: new Date().toISOString()
        };
        await AuroraDB.saveInvestment(updatedAsset);
      } else {
        const newAsset = {
          id: `INV-${Math.floor(1000 + Math.random() * 8999)}`,
          userId: sourceAcc.userId,
          type: selectedAsset.category as any,
          name: selectedAsset.name,
          symbol: selectedAsset.symbol,
          quantity,
          buyPrice: selectedAsset.price,
          currentPrice: selectedAsset.price,
          investedAmount: totalCost,
          currentValue: totalCost,
          lastUpdated: new Date().toISOString()
        };
        await AuroraDB.saveInvestment(newAsset);
      }

      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
        userId: sourceAcc.userId,
        accountId: sourceAcc.id,
        amount: -totalCost,
        category: "Investment" as any,
        merchant: `Invest: Buy ${selectedAsset.name}`,
        description: `Purchased ${quantity} units of ${selectedAsset.symbol} at $${selectedAsset.price}/unit`,
        date: new Date().toISOString(),
        status: "Completed" as any,
        referenceNumber: `INV${Math.floor(100000 + Math.random()*900000)}`
      };
      await AuroraDB.saveTransaction(newTxn);

      triggerNotification(
        "Shares Purchased Successfully",
        `Purchased ${quantity} units of ${tradeSymbol} for $${totalCost.toLocaleString()}.`,
        "Transaction"
      );
      alert(`[TRADE EXECUTED] Bought ${quantity} shares of ${tradeSymbol} successfully!`);
      setTradeQty("");
    } else if (tradeType === "Sell") {
      const dbAsset = state.investments.find((i: any) => i.symbol === tradeSymbol && i.userId === sourceAcc.userId);
      if (!dbAsset || dbAsset.quantity < quantity) {
        setError(`Error: You do not possess sufficient shares of ${tradeSymbol} to liquidate.`);
        return;
      }

      const updatedSourceAcc = {
        ...sourceAcc,
        balance: sourceAcc.balance + totalCost
      };
      await AuroraDB.saveAccount(updatedSourceAcc);

      if (dbAsset.quantity === quantity) {
        await AuroraDB.deleteInvestment(dbAsset.id);
      } else {
        const updatedAsset = {
          ...dbAsset,
          quantity: dbAsset.quantity - quantity,
          investedAmount: dbAsset.investedAmount - dbAsset.buyPrice * quantity,
          currentValue: (dbAsset.quantity - quantity) * selectedAsset.price,
          lastUpdated: new Date().toISOString()
        };
        await AuroraDB.saveInvestment(updatedAsset);
      }

      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
        userId: sourceAcc.userId,
        accountId: sourceAcc.id,
        amount: totalCost,
        category: "Investment" as any,
        merchant: `Invest: Sell ${selectedAsset.name}`,
        description: `Liquidated ${quantity} units of ${selectedAsset.symbol} at $${selectedAsset.price}/unit`,
        date: new Date().toISOString(),
        status: "Completed" as any,
        referenceNumber: `INV${Math.floor(100000 + Math.random()*900000)}`
      };
      await AuroraDB.saveTransaction(newTxn);

      triggerNotification(
        "Assets Liquidated",
        `Liquidated ${quantity} units of ${tradeSymbol}. Credited checking account line.`,
        "Transaction"
      );
      alert(`[TRADE EXECUTED] Sold ${quantity} shares of ${tradeSymbol} successfully.`);
      setTradeQty("");
    } else {
      // Transfer action between accounts
      const savingsAcc = state.accounts.find((a: any) => a.type === "Savings Account");
      if (!savingsAcc) {
        setError("Savings Account line not found for transfer.");
        return;
      }

      if (sourceAcc.balance < totalCost) {
        setError("Insufficient funds in Checking Account to complete transfer.");
        return;
      }

      const updatedSourceAcc = {
        ...sourceAcc,
        balance: sourceAcc.balance - totalCost
      };
      const updatedSavingsAcc = {
        ...savingsAcc,
        balance: savingsAcc.balance + totalCost
      };
      await AuroraDB.saveAccount(updatedSourceAcc);
      await AuroraDB.saveAccount(updatedSavingsAcc);

      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
        userId: sourceAcc.userId,
        accountId: sourceAcc.id,
        amount: -totalCost,
        category: "Transfer" as any,
        merchant: "Intra-Account Investment Transfer",
        description: `Transferred $${totalCost.toLocaleString()} to Savings Account`,
        date: new Date().toISOString(),
        status: "Completed" as any,
        referenceNumber: `TRF${Math.floor(100000 + Math.random()*900000)}`
      };
      await AuroraDB.saveTransaction(newTxn);

      triggerNotification(
        "Intra-Account Transfer",
        `Moved $${totalCost.toLocaleString()} from checking to savings.`,
        "Transaction"
      );
      alert(`[TRANSFER EXECUTED] Intra-account transfer completed!`);
      setTradeQty("");
    }
  };

  const handleDownloadStatement = () => {
    alert("[STATEMENT GENERATED] Your quarterly investment portfolio statement has been downloaded in PDF format.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveView("home")}
          type="button"
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Investments</h2>
        <button
          onClick={handleDownloadStatement}
          type="button"
          className="p-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold px-3"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Statement</span>
        </button>
      </div>

      {/* Luxury Portfolio Performance Card */}
      <div className="bg-gradient-to-tr from-[#05112A] via-[#1E3A8A]/35 to-[#05112A] border border-white/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 font-bold block uppercase">Portfolio Valuation</span>
            <div className="text-2xl font-black text-white mt-1">
              ${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="flex items-center gap-2 mt-1.5 text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                ▲ {chartsData[activeRange]?.returnStr}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">{chartsData[activeRange]?.gainVal} ({activeRange})</span>
            </div>
          </div>
        </div>

        {/* Dynamic Vector Spline Curve */}
        <div className="mt-6 h-28 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="invChartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polyline
              fill="url(#invChartGlow)"
              stroke="none"
              points={`0,100 ${getSvgCoordinates()} 300,100`}
            />
            <polyline
              fill="none"
              stroke="#D8A63D"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getSvgCoordinates()}
            />
          </svg>
        </div>

        {/* Dynamic Range select tabs */}
        <div className="flex justify-between mt-4 border-t border-white/5 pt-3.5">
          {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold transition-colors ${activeRange === range ? "bg-[#D8A63D] text-gray-900 shadow" : "text-gray-400 hover:text-white"}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Exploration Categories slider */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Explore Sectors</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 border rounded-xl text-xs font-semibold font-mono tracking-wider transition-all ${selectedCategory === cat ? "border-[#2563EB] bg-[#2563EB]/10 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Available Assets/Holdings Category lists */}
      <div className="grid grid-cols-1 gap-2.5">
        <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">
          {selectedCategory === "All Categories" ? "Market Highlights" : `${selectedCategory} Sector`}
        </span>
        
        {activeCategoryAssets.map((asset, idx) => {
          const matchingHolding = investments.find((i: any) => i.symbol === asset.symbol);
          return (
            <div
              key={idx}
              onClick={() => {
                if (matchingHolding) {
                  setSelectedHolding({ ...matchingHolding, ...asset });
                } else {
                  setSelectedHolding({
                    symbol: asset.symbol,
                    name: asset.name,
                    category: asset.category,
                    currentPrice: asset.price,
                    quantity: 0,
                    investedAmount: 0,
                    currentValue: 0,
                    change: asset.change,
                    purchaseDate: asset.purchaseDate
                  });
                }
              }}
              className="p-4 bg-white/5 border border-white/5 hover:border-white/15 rounded-2xl flex justify-between items-center cursor-pointer transition-all text-left"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{asset.name}</span>
                  <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                    {asset.symbol}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex gap-2 font-mono">
                  <span>{asset.category}</span>
                  <span>•</span>
                  <span className={asset.change > 0 ? "text-emerald-400" : "text-rose-400"}>
                    {asset.change > 0 ? "▲" : "▼"} {Math.abs(asset.change)}% Today
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                {matchingHolding && (
                  <span className="text-[9px] font-mono text-emerald-400 block mt-1">
                    Holding: {matchingHolding.quantity} units
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Trading terminal Execution drawer panel */}
      <form onSubmit={handleTradeSubmit} className="bg-white/5 border border-[#D8A63D]/20 rounded-3xl p-5 space-y-4">
        <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase font-bold block border-b border-white/5 pb-2">Direct Trading Terminal</span>

        <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1 rounded-xl">
          {(["Buy", "Sell", "Transfer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTradeType(t);
                setError("");
              }}
              className={`py-2 rounded-lg font-mono text-[10px] font-bold tracking-wide transition-all ${tradeType === t ? "bg-[#2563EB] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Input selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">SELECT ASSET</label>
            <select
              value={tradeSymbol}
              onChange={e => setTradeSymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              {marketAssets.map(a => (
                <option key={a.symbol} value={a.symbol} className="bg-[#071C3F] text-white">
                  {a.symbol} (${a.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">
              {tradeType === "Transfer" ? "TRANSFER AMOUNT" : "QUANTITY SHARES"}
            </label>
            <input
              type="number"
              required
              value={tradeQty}
              onChange={e => setTradeQty(e.target.value)}
              placeholder={tradeType === "Transfer" ? "Amount in $" : "Number of units"}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Price projection widgets */}
        {tradeQty && tradeType !== "Transfer" && (
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 text-xs font-mono">
            <span className="text-gray-400">ESTIMATED VALUATION:</span>
            <span className="text-[#D8A63D] font-bold">
              ${(parseFloat(tradeQty) * selectedAsset.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
            </span>
          </div>
        )}

        {error && (
          <div className="text-[10px] text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-[#2563EB] hover:brightness-110 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider"
        >
          EXECUTE {tradeType} ORDER
        </button>
      </form>

      {/* HOLDINGS DETAILS BOTTOM SHEET / MODAL */}
      <AnimatePresence>
        {selectedHolding && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#071C33] border border-white/10 rounded-3xl p-6 shadow-2xl text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedHolding.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{selectedHolding.symbol} • {selectedHolding.category}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHolding(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {/* Stats blocks */}
              <div className="grid grid-cols-2 gap-3.5 font-mono text-xs">
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="text-[8px] text-gray-400 uppercase">Current Value</span>
                  <div className="text-sm font-bold text-white mt-1">
                    ${(selectedHolding.currentValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="text-[8px] text-gray-400 uppercase">Units Owned</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedHolding.quantity || 0} shares
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="text-[8px] text-gray-400 uppercase">Cost Basis</span>
                  <div className="text-sm font-bold text-white mt-1">
                    ${(selectedHolding.investedAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="text-[8px] text-gray-400 uppercase">Total Return</span>
                  <div className={`text-sm font-bold mt-1 ${((selectedHolding.currentValue || 0) - (selectedHolding.investedAmount || 0)) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    ${((selectedHolding.currentValue || 0) - (selectedHolding.investedAmount || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Extra technical parameters */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">CURRENT MARKET PRICE:</span>
                  <span className="font-bold text-white">${selectedHolding.currentPrice?.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ASSET PERCENTAGE CHANGE:</span>
                  <span className={`font-bold ${selectedHolding.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {selectedHolding.change >= 0 ? "▲" : "▼"} {Math.abs(selectedHolding.change)}% Today
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">INITIAL DEPLOYMENT DATE:</span>
                  <span className="font-bold text-white">{selectedHolding.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">LIQUIDITY LEVEL:</span>
                  <span className="font-bold text-blue-400">High Tier Amortization</span>
                </div>
              </div>

              {/* Trade triggers from detailed sheet */}
              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setTradeSymbol(selectedHolding.symbol);
                    setTradeType("Sell");
                    setSelectedHolding(null);
                  }}
                  className="w-full py-2.5 bg-rose-600/20 border border-rose-500/25 hover:bg-rose-600/30 text-rose-400 font-bold text-xs rounded-xl"
                >
                  Sell / Liquidate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTradeSymbol(selectedHolding.symbol);
                    setTradeType("Buy");
                    setSelectedHolding(null);
                  }}
                  className="w-full py-2.5 bg-[#2563EB] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Buy More
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 9. PROFILE (Details & edits)
// =============================================================
function ProfileView({ user, syncDB, setActiveView }: any) {
  // Navigation Section Accordion States
  const [activeSection, setActiveSection] = useState<string>("personal");

  // Profile fields state
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  
  const [address, setAddress] = useState(user.address || "");
  const [city, setCity] = useState("New York");
  const [stateName, setStateName] = useState("NY");
  const [zipCode, setZipCode] = useState("10005");
  
  const [dob, setDob] = useState(user.dob || "1992-08-15");
  const [gender, setGender] = useState("Female");
  const [nationality, setNationality] = useState("American");
  const [maritalStatus, setMaritalStatus] = useState("Single");

  const [employment, setEmployment] = useState(user.employment || "");
  const [employer, setEmployer] = useState("Aurora Tech Labs");
  const [incomeRange, setIncomeRange] = useState("$120,000 - $150,000");

  const [nextOfKin, setNextOfKin] = useState(user.nextOfKin || "");
  const [nokRelation, setNokRelation] = useState("Sister");

  const [prefLanguage, setPrefLanguage] = useState("English");
  const [prefCurrency, setPrefCurrency] = useState("USD");
  const [primaryAccount, setPrimaryAccount] = useState("Checking ACC-5521");

  const [commMarketing, setCommMarketing] = useState(true);
  const [commPush, setCommPush] = useState(true);
  const [commSms, setCommSms] = useState(true);
  const [commPaper, setCommPaper] = useState(false);

  const [alertLogin, setAlertLogin] = useState(true);
  const [alertLowBal, setAlertLowBal] = useState(true);
  const [alertLargeTx, setAlertLargeTx] = useState(true);

  const [tinNumber, setTinNumber] = useState("XXX-XX-9827");
  const [taxResidency, setTaxResidency] = useState("United States");

  // Avatar Management states
  const [profilePic, setProfilePic] = useState(user.profilePic || "");
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationLevel, setRotationLevel] = useState(0);

  const preloadedAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&h=256&fit=crop"
  ];

  const toggleAccordion = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? "" : sectionId);
  };

  const handleSaveProfile = async () => {
    const state = AuroraDB.getState();
    const dbUser = state.users.find((u: any) => u.id === user.id);
    if (dbUser) {
      const updatedUser = {
        ...dbUser,
        firstName,
        lastName,
        email,
        phone,
        address,
        dob,
        employment,
        nextOfKin,
        preferredCurrency: prefCurrency,
        profilePic
      };

      const auditLog = {
        id: `AUD-${Math.floor(10000 + Math.random()*90000)}`,
        adminUsername: dbUser.username,
        action: "Self Profile Modification",
        details: `Updated personal contact, name, DOB and address details. Residential Address set to ${address}.`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveUser(updatedUser);
      await AuroraDB.saveAuditLog(auditLog);
      alert("[PROFILE SYNCHRONIZED] Personal credentials and audit registries updated successfully!");
    }
  };

  const handleSelectAvatar = (url: string) => {
    setProfilePic(url);
    setShowCropModal(false);
  };

  const handleUploadPic = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mockReaderUrl = URL.createObjectURL(file);
      setProfilePic(mockReaderUrl);
      setShowCropModal(true);
    }
  };

  const handleRemovePic = () => {
    setProfilePic("");
    alert("[AVATAR REMOVED] Profile photo reverted to initials placeholder.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveView("home")}
          type="button"
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Profile Details</h2>
        <button
          onClick={handleSaveProfile}
          type="button"
          className="px-4 py-1.5 bg-[#2563EB] text-white hover:brightness-110 rounded-xl text-xs font-bold shadow-md"
        >
          Save
        </button>
      </div>

      {/* Profile Photo Display top section */}
      <div className="flex flex-col items-center text-center p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl relative">
        <div className="relative group">
          {profilePic ? (
            <img
              src={profilePic}
              className="w-24 h-24 rounded-full border-2 border-[#D8A63D] object-cover transition-transform group-hover:scale-105 duration-300"
              alt="Avatar"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotationLevel}deg)`,
                imageRendering: "auto"
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-[#D8A63D] bg-blue-600 flex items-center justify-center font-extrabold text-2xl text-white">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
          )}
          
          {/* Managed by administrator indicator */}
          <div className="absolute -bottom-1 -right-1 bg-[#D8A63D] text-[#071C3F] p-1.5 rounded-full border border-[#071C3F] shadow-lg" title="Profile picture managed by administrator">
            <Lock className="w-3 h-3" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mt-3">{firstName} {lastName}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono text-[#D8A63D] bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
            {user.id}
          </span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
            VERIFIED SECURE
          </span>
        </div>

        <p className="text-[10px] text-gray-400 mt-2">Active Banking Account Status: <span className="text-emerald-400 font-bold">ACTIVE</span></p>
      </div>

      {/* Profile Sections Collapsible Accordion Wrapper */}
      <div className="space-y-3">
        
        {/* 1. PERSONAL INFORMATION */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("personal")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>👤 Personal Credentials</span>
            <span>{activeSection === "personal" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "personal" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] font-mono text-gray-400 uppercase">First Name</label>
                    <span className="text-[8px] font-mono text-[#D8A63D] flex items-center gap-1 font-bold">
                      <Lock className="w-2 h-2" /> LOCKED
                    </span>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-[#071C3F]/20 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed font-medium"
                    title="This credential can only be modified by system administrators."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] font-mono text-gray-400 uppercase">Last Name</label>
                    <span className="text-[8px] font-mono text-[#D8A63D] flex items-center gap-1 font-bold">
                      <Lock className="w-2 h-2" /> LOCKED
                    </span>
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-[#071C3F]/20 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed font-medium"
                    title="This credential can only be modified by system administrators."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] font-mono text-gray-400 uppercase">Date of Birth</label>
                    <span className="text-[8px] font-mono text-[#D8A63D] flex items-center gap-1 font-bold">
                      <Lock className="w-2 h-2" /> LOCKED
                    </span>
                  </div>
                  <input
                    type="date"
                    value={dob}
                    readOnly
                    className="w-full px-3.5 py-2 bg-[#071C3F]/20 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed font-medium"
                    title="This credential can only be modified by system administrators."
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={e => setMaritalStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 2. CONTACT INFORMATION */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("contact")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>📞 Contact Credentials</span>
            <span>{activeSection === "contact" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "contact" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 3. RESIDENTIAL ADDRESS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("address")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>🏡 Residential Address</span>
            <span>{activeSection === "address" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "address" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">ZIP Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 4. EMPLOYMENT PROFILE */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("employment")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>💼 Employment & Income</span>
            <span>{activeSection === "employment" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "employment" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Occupation / Designation</label>
                <input
                  type="text"
                  value={employment}
                  onChange={e => setEmployment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Employer / Corporate Entity</label>
                <input
                  type="text"
                  value={employer}
                  onChange={e => setEmployer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Monthly Income Bracket</label>
                <select
                  value={incomeRange}
                  onChange={e => setIncomeRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white"
                >
                  <option value="Under $50,000">Under $50,000</option>
                  <option value="$50,000 - $80,000">$50,000 - $80,000</option>
                  <option value="$80,000 - $120,000">$80,000 - $120,000</option>
                  <option value="$120,000 - $150,000">$120,000 - $150,000</option>
                  <option value="Above $150,000">Above $150,000</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* 5. NEXT OF KIN */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("nok")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>👨‍👩‍👧 Next Of Kin / Beneficiary</span>
            <span>{activeSection === "nok" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "nok" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Full Legal Name</label>
                <input
                  type="text"
                  value={nextOfKin}
                  onChange={e => setNextOfKin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Relationship</label>
                <input
                  type="text"
                  value={nokRelation}
                  onChange={e => setNokRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 6. ACCOUNT PREFERENCES */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("prefs")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>⚙ Account Preferences</span>
            <span>{activeSection === "prefs" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "prefs" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Preferred Interface Language</label>
                <select
                  value={prefLanguage}
                  onChange={e => setPrefLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white"
                >
                  <option value="English">English (US)</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="German">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Base Settlement Currency</label>
                <select
                  value={prefCurrency}
                  onChange={e => setPrefCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 mb-1.5 uppercase">Primary Linked Funding Line</label>
                <select
                  value={primaryAccount}
                  onChange={e => setPrimaryAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071C3F] border border-white/10 rounded-xl text-white"
                >
                  <option value="Checking ACC-5521">Checking Account (ACC-5521)</option>
                  <option value="Savings ACC-0983">Savings Account (ACC-0983)</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* 7. COMMUNICATION PREFERENCES */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("comm")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>✉ Communication Preferences</span>
            <span>{activeSection === "comm" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "comm" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-3.5 text-xs"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Email Marketing Announcements</span>
                  <span className="text-[10px] text-gray-400">Receive weekly circulars and security guides</span>
                </div>
                <input
                  type="checkbox"
                  checked={commMarketing}
                  onChange={() => setCommMarketing(!commMarketing)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <div>
                  <span className="font-bold text-white block">Device Push Notifications</span>
                  <span className="text-[10px] text-gray-400">Receive instant push notifications for receipts</span>
                </div>
                <input
                  type="checkbox"
                  checked={commPush}
                  onChange={() => setCommPush(!commPush)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <div>
                  <span className="font-bold text-white block">SMS Critical Transaction Alerts</span>
                  <span className="text-[10px] text-gray-400">Receive 2FA codes and activity alerts on cell</span>
                </div>
                <input
                  type="checkbox"
                  checked={commSms}
                  onChange={() => setCommSms(!commSms)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <div>
                  <span className="font-bold text-white block">Paper Statement Invoicing</span>
                  <span className="text-[10px] text-gray-400">Mail physical paper invoice logs monthly ($3.00/mo)</span>
                </div>
                <input
                  type="checkbox"
                  checked={commPaper}
                  onChange={() => setCommPaper(!commPaper)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 8. NOTIFICATION ALERTS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("alerts")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>🔔 Push Notifications Settings</span>
            <span>{activeSection === "alerts" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "alerts" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-3.5 text-xs"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Login Alerts Security</span>
                  <span className="text-[10px] text-gray-400">Trigger alert on any device or location changes</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertLogin}
                  onChange={() => setAlertLogin(!alertLogin)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <div>
                  <span className="font-bold text-white block">Low Balance Indicator</span>
                  <span className="text-[10px] text-gray-400">Notify when checking line falls under $500.00</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertLowBal}
                  onChange={() => setAlertLowBal(!alertLowBal)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <div>
                  <span className="font-bold text-white block">Large Transaction Warnings</span>
                  <span className="text-[10px] text-gray-400">Request explicit 2FA clearance for transactions over $1,000</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertLargeTx}
                  onChange={() => setAlertLargeTx(!alertLargeTx)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 9. TAX & SSN CLASSIFICATION */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion("tax")}
            type="button"
            className="w-full p-4 flex justify-between items-center text-xs font-bold font-mono text-white tracking-wider uppercase text-left"
          >
            <span>📜 Tax & Document Identification</span>
            <span>{activeSection === "tax" ? "▲" : "▼"}</span>
          </button>
          
          {activeSection === "tax" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-5 border-t border-white/5 space-y-4 text-xs font-mono"
            >
              <div>
                <span className="text-gray-400 block uppercase text-[9px]">Taxpayer Identification Number (TIN)</span>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={e => setTinNumber(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <span className="text-gray-400 block uppercase text-[9px]">Tax Residency Jurisdiction</span>
                <input
                  type="text"
                  value={taxResidency}
                  onChange={e => setTaxResidency(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-[#071C3F]/50 border border-white/10 rounded-xl text-white font-mono"
                />
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 text-[11px] leading-relaxed text-gray-300">
                <span className="font-bold text-white block text-xs">Regulatory KYC Compliance Notice</span>
                The tax parameters verified on this platform are reported in conformity with global CRS and FATCA declarations. Any changes might trigger supplementary compliance document request.
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* PHOTO ADJUSTMENT & CROPPING SHEET MODAL */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#071C33] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adjust Profile Avatar</h3>
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Photo Preview inside Crop Ring */}
              <div className="flex justify-center py-4 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden h-44 items-center">
                {profilePic ? (
                  <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#D8A63D] overflow-hidden flex items-center justify-center bg-black">
                    <img
                      src={profilePic}
                      alt="Crop Preview"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotationLevel}deg)`,
                        transition: "transform 0.1s ease"
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">No Image Active</span>
                )}
              </div>

              {/* Crop sliders */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>ZOOM ENLARGEMENT</span>
                    <span>{(zoomLevel * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>ROTATION DEGREE</span>
                    <span>{rotationLevel}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={rotationLevel}
                    onChange={(e) => setRotationLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                  />
                </div>
              </div>

              {/* Custom Image selection triggers */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Preset Luxury Icons</span>
                <div className="flex justify-between gap-2">
                  {preloadedAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAvatar(url)}
                      type="button"
                      className="w-11 h-11 rounded-full overflow-hidden border border-white/20 hover:border-[#D8A63D] transition-all"
                    >
                      <img src={url} className="w-full h-full object-cover" alt="Preset" />
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <button
                    onClick={() => document.getElementById("file_picker_profile")?.click()}
                    type="button"
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[10px] font-bold rounded-xl"
                  >
                    Upload Custom Image
                  </button>
                  <input
                    type="file"
                    id="file_picker_profile"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUploadPic}
                  />

                  <button
                    onClick={() => setShowCropModal(false)}
                    type="button"
                    className="px-4 py-2 bg-[#2563EB] hover:brightness-110 text-white text-[10px] font-bold rounded-xl shadow"
                  >
                    Apply Crop Adjust
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 10. SECURITY CENTER
// =============================================================
function SecurityView({ user, securityLogs, syncDB, triggerNotification, setActiveView }: any) {
  const [activeTab, setActiveTab] = useState<"authorization" | "devices" | "credentials" | "alerts" | "privacy">("authorization");

  // Core authorization toggles
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState({
    faceId: user.biometricsEnabled?.faceId || true,
    fingerprint: user.biometricsEnabled?.fingerprint || true
  });

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passStrength, setPassStrength] = useState({ score: 0, label: "Empty", color: "bg-gray-700" });

  // PIN change form
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Trusted devices list state
  const [trustedDevices, setTrustedDevices] = useState([
    { id: "DEV-1", name: "iPhone 15 Pro", location: "New York, USA", ip: "192.168.1.14", lastActive: "Active Now", isCurrent: true },
    { id: "DEV-2", name: "MacBook Pro M3 Max", location: "New York, USA", ip: "192.168.1.2", lastActive: "2 hours ago", isCurrent: false },
    { id: "DEV-3", name: "iPad Pro 11\"", location: "Miami, USA", ip: "172.56.21.9", lastActive: "4 days ago", isCurrent: false }
  ]);

  // Security Alerts Preferences
  const [alerts, setAlerts] = useState({
    newLogin: true,
    largeTx: true,
    passChange: true,
    failedLogin: true,
    deviceChange: true,
    cardUsage: true,
    intlTx: false
  });

  // Privacy Settings Preferences
  const [privacy, setPrivacy] = useState({
    marketing: true,
    dataSharing: false,
    cookies: true,
    communications: true
  });

  // Strength meter calculator on password typing
  const handlePasswordChange = (val: string) => {
    setNewPassword(val);
    if (!val) {
      setPassStrength({ score: 0, label: "Empty", color: "bg-gray-700" });
      return;
    }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score === 1) setPassStrength({ score: 1, label: "Weak ⚠️", color: "bg-red-500" });
    else if (score === 2) setPassStrength({ score: 2, label: "Fair 😐", color: "bg-amber-500" });
    else if (score === 3) setPassStrength({ score: 3, label: "Good 👍", color: "bg-blue-500" });
    else if (score === 4) setPassStrength({ score: 4, label: "Excellent Shield 💪", color: "bg-emerald-500" });
  };

  const toggle2fa = () => {
    const nextVal = !is2faEnabled;
    setIs2faEnabled(nextVal);
    triggerNotification(
      "Two-Factor Auth Toggle",
      `Two-factor security signing was ${nextVal ? "enabled" : "disabled"}.`,
      "Security"
    );
  };

  const toggleBiometric = async (type: "faceId" | "fingerprint") => {
    const updated = { ...isBiometricsEnabled, [type]: !isBiometricsEnabled[type] };
    setIsBiometricsEnabled(updated);
    
    // Save to database state
    const state = AuroraDB.getState();
    const dbUser = state.users.find((u: any) => u.id === user.id);
    if (dbUser) {
      const updatedUser = {
        ...dbUser,
        biometricsEnabled: updated
      };
      await AuroraDB.saveUser(updatedUser);
    }

    triggerNotification(
      "Biometrics Preferences Modified",
      `${type === "faceId" ? "Face ID" : "Fingerprint"} authentication permissions updated.`,
      "Security"
    );
  };

  // Trusted Devices actions
  const handleRenameDevice = (devId: string) => {
    const currentName = trustedDevices.find(d => d.id === devId)?.name || "";
    const nextName = prompt("Rename your trusted access token device:", currentName);
    if (nextName && nextName.trim()) {
      setTrustedDevices(prev => prev.map(d => d.id === devId ? { ...d, name: nextName } : d));
      triggerNotification(
        "Device Name Modified",
        `Trusted token was renamed to ${nextName}.`,
        "Security"
      );
    }
  };

  const handleRemoveDevice = (devId: string) => {
    const dev = trustedDevices.find(d => d.id === devId);
    if (dev?.isCurrent) {
      alert("Error: You cannot terminate your active session device. Sign out of other sessions instead.");
      return;
    }
    if (confirm(`Confirm remote authorization termination for ${dev?.name}?`)) {
      setTrustedDevices(prev => prev.filter(d => d.id !== devId));
      triggerNotification(
        "Remote Session Cleared",
        `Signed out remotely from ${dev?.name}.`,
        "Security"
      );
    }
  };

  const handleSignOutRemoteAll = () => {
    if (confirm("Terminate all remote sessions? Your current active device session will be preserved.")) {
      setTrustedDevices(prev => prev.filter(d => d.isCurrent));
      triggerNotification(
        "Remote Sessions Flushed",
        "Successfully cleared all secondary trusted tokens remotely.",
        "Security"
      );
    }
  };

  // Change Password Submission
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Please input your current account access password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Validation Error: New Password and Confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Security Error: New Password must be at least 8 characters.");
      return;
    }

    const state = AuroraDB.getState();
    const dbUser = state.users.find((u: any) => u.id === user.id);
    if (dbUser) {
      const updatedUser = {
        ...dbUser,
        password: newPassword
      };
      const secLog = {
        id: `SEC-${Math.floor(10000 + Math.random()*90000)}`,
        userId: user.id,
        event: "Account Password Modified",
        device: "iPhone 15 Pro",
        location: "New York, USA",
        date: new Date().toISOString(),
        status: "Success" as any
      };
      await AuroraDB.saveUser(updatedUser);
      await AuroraDB.saveSecurityLog(secLog);
    }

    triggerNotification(
      "Password Changed Successfully",
      "Your core account login password was successfully changed.",
      "Security"
    );
    alert("[PASSWORD CHANGED] Password credentials successfully written. Your active sessions remain logged in.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPassStrength({ score: 0, label: "Empty", color: "bg-gray-700" });
  };

  // Change Transaction PIN Submission
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== user.transactionPin) {
      alert("Incorrect Current Transaction security PIN.");
      return;
    }
    if (newPin !== confirmPin) {
      alert("PIN inputs mismatch. Confirm PIN correctly.");
      return;
    }
    if (newPin.length !== 4) {
      alert("PIN must be exactly 4 digits.");
      return;
    }

    const state = AuroraDB.getState();
    const dbUser = state.users.find((u: any) => u.id === user.id);
    if (dbUser) {
      const updatedUser = {
        ...dbUser,
        transactionPin: newPin
      };
      const secLog = {
        id: `SEC-${Math.floor(10000 + Math.random()*90000)}`,
        userId: user.id,
        event: "Transaction PIN Changed",
        device: "iPhone 15 Pro",
        location: "New York, USA",
        date: new Date().toISOString(),
        status: "Success" as any
      };
      await AuroraDB.saveUser(updatedUser);
      await AuroraDB.saveSecurityLog(secLog);

      triggerNotification(
        "Transaction PIN Modified",
        "Core ATM / Transaction signature PIN modified successfully.",
        "Security"
      );
      alert("[PIN SECURITY] Your transaction credentials PIN was updated.");
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
    }
  };

  // Emergency Actions Handler
  const handleEmergencyAction = async (type: "LOCK" | "FREEZE_CARDS" | "FRAUD") => {
    if (type === "LOCK") {
      const confirmLock = confirm("CRITICAL WARNING: This will immediately lock and suspend all digital bank account lines, transfers, and card authorizations. You must visit a localized physical branch to clear. Proceed?");
      if (confirmLock) {
        const state = AuroraDB.getState();
        const dbUser = state.users.find((u: any) => u.id === user.id);
        if (dbUser) {
          const updatedUser = {
            ...dbUser,
            status: "Suspended" as any
          };
          const secLog = {
            id: `SEC-${Math.floor(10000 + Math.random()*90000)}`,
            userId: user.id,
            event: "EMERGENCY SELF-SUSPENSION TRIGGERED",
            device: "iPhone 15 Pro",
            location: "New York, USA",
            date: new Date().toISOString(),
            status: "Success" as any
          };
          await AuroraDB.saveUser(updatedUser);
          await AuroraDB.saveSecurityLog(secLog);
        }

        triggerNotification(
          "Emergency Block Engaged",
          "CORE BANK ACCOUNT LINES TERMINATED INSTANTLY",
          "Security"
        );
        alert("[ACCOUNT SUSPENDED] Core bank lines locked instantly. Contact 24/7 Priority Emergency Desks.");
      }
    } else if (type === "FREEZE_CARDS") {
      if (confirm("Freeze all debit, credit, and virtual cards instantly?")) {
        const state = AuroraDB.getState();
        const userCards = state.cards.filter((c: any) => c.userId === user.id);
        for (const card of userCards) {
          const updatedCard = {
            ...card,
            status: "Frozen" as any
          };
          await AuroraDB.saveCard(updatedCard);
        }
        triggerNotification(
          "All Cards Locked",
          "All registered credit and debit card lines frozen.",
          "Security"
        );
        alert("[ALL CARDS FROZEN] All linked card payment vectors suspended.");
      }
    } else {
      alert("[FRAUD REPORTED] Security Team alerted. Your designated representative will call you immediately.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 text-left relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveView("home")}
          type="button"
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Security Center</h2>
        <div className="w-16" />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-none">
        {[
          { id: "authorization", label: "Access Control" },
          { id: "devices", label: "Devices" },
          { id: "credentials", label: "Credentials" },
          { id: "alerts", label: "Alerts" },
          { id: "privacy", label: "Privacy" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`shrink-0 px-3.5 py-2 rounded-lg font-mono text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? "bg-[#2563EB] text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. ACCESS CONTROL TAB */}
      {activeTab === "authorization" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Biometrics & 2FA Toggles</span>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 text-xs">
            
            {/* 2FA Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Two-Factor Authentication</span>
                <span className="text-[10px] text-gray-400">Enforce OTP on transfers and payment signature</span>
              </div>
              <input
                type="checkbox"
                checked={is2faEnabled}
                onChange={toggle2fa}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* FaceID Toggle */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Enable Face ID login</span>
                <span className="text-[10px] text-gray-400">Unlock biometric facial camera scans</span>
              </div>
              <input
                type="checkbox"
                checked={isBiometricsEnabled.faceId}
                onChange={() => toggleBiometric("faceId")}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Fingerprint Toggle */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Enable Touch ID fingerprint</span>
                <span className="text-[10px] text-gray-400">Use capacitive fingerprint hardware checks</span>
              </div>
              <input
                type="checkbox"
                checked={isBiometricsEnabled.fingerprint}
                onChange={() => toggleBiometric("fingerprint")}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Access Session Log list */}
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold pt-2">Session Event History</span>
          <div className="space-y-2">
            {securityLogs.slice(0, 3).map((log: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center text-xs text-left"
              >
                <div>
                  <div className="font-bold text-white">{log.event}</div>
                  <div className="text-[9px] text-gray-400 mt-1 font-mono">
                    {log.device} • {log.location} • {new Date(log.date).toLocaleString()}
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${log.status === "Success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {log.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 2. TRUSTED DEVICES TAB */}
      {activeTab === "devices" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase font-bold">Trusted Hardware Tokens</span>
            <button
              onClick={handleSignOutRemoteAll}
              type="button"
              className="text-[9px] font-mono font-bold text-red-400 border border-red-500/20 bg-red-500/5 px-2.5 py-1 rounded-lg"
            >
              Sign Out Remote All
            </button>
          </div>

          <div className="space-y-2.5">
            {trustedDevices.map((device) => (
              <div
                key={device.id}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center text-xs text-left"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{device.name}</span>
                    {device.isCurrent && (
                      <span className="text-[8px] font-mono bg-blue-600 px-1.5 py-0.5 rounded leading-none text-white">CURRENT</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1.5 font-mono">
                    {device.location} • IP: {device.ip}
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono mt-1 block">Last Active: {device.lastActive}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRenameDevice(device.id)}
                    type="button"
                    className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 text-[10px]"
                    title="Rename"
                  >
                    ✏️
                  </button>
                  {!device.isCurrent && (
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      type="button"
                      className="p-1.5 bg-red-600/10 border border-red-500/20 text-red-400 rounded-lg text-[10px]"
                      title="Terminate session"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. CREDENTIALS CHANGE TAB */}
      {activeTab === "credentials" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Change Password Form */}
          <form onSubmit={handleSavePassword} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase font-bold block border-b border-white/5 pb-2">Change Password</span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">New Secure Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => handlePasswordChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
                
                {/* Visual strength indicator bar */}
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-gray-400">
                    <span>SECURITY SHIELD DEPTH</span>
                    <span>{passStrength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passStrength.color}`}
                      style={{ width: `${(passStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#2563EB] hover:brightness-110 text-white rounded-xl text-xs font-bold"
            >
              Update Password Credentials
            </button>
          </form>

          {/* Change Transaction PIN Form */}
          <form onSubmit={handleSavePin} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase font-bold block border-b border-white/5 pb-2">Change Transaction PIN</span>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase">Current 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={oldPin}
                  onChange={e => setOldPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center tracking-[1em] text-white focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center tracking-[1em] text-white focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center tracking-[1em] text-white focus:outline-none text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#2563EB] hover:brightness-110 text-white rounded-xl text-xs font-bold"
            >
              Update Transaction PIN
            </button>
          </form>
        </motion.div>
      )}

      {/* 4. SECURITY ALERTS TAB */}
      {activeTab === "alerts" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Granular Push Alerts</span>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 text-xs">
            {/* New Login */}
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">New Login Alerts</span>
                <span className="text-[10px] text-gray-400">Trigger on any novel hardware tokens or IP changes</span>
              </div>
              <input
                type="checkbox"
                checked={alerts.newLogin}
                onChange={() => setAlerts(prev => ({ ...prev, newLogin: !prev.newLogin }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Large Transactions */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Large Transactions Alert</span>
                <span className="text-[10px] text-gray-400">Alert on transaction amounts exceeding $1,000.00</span>
              </div>
              <input
                type="checkbox"
                checked={alerts.largeTx}
                onChange={() => setAlerts(prev => ({ ...prev, largeTx: !prev.largeTx }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Password Changes */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Credential Modifications alert</span>
                <span className="text-[10px] text-gray-400">Notify immediately when passwords or PINs change</span>
              </div>
              <input
                type="checkbox"
                checked={alerts.passChange}
                onChange={() => setAlerts(prev => ({ ...prev, passChange: !prev.passChange }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Failed Login Attempts */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Failed Login Attempts</span>
                <span className="text-[10px] text-gray-400">Notify after 2 failed security password attempts</span>
              </div>
              <input
                type="checkbox"
                checked={alerts.failedLogin}
                onChange={() => setAlerts(prev => ({ ...prev, failedLogin: !prev.failedLogin }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Card Usage */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Card Purchase alerts</span>
                <span className="text-[10px] text-gray-400">Notify instantly on debit or credit swipes</span>
              </div>
              <input
                type="checkbox"
                checked={alerts.cardUsage}
                onChange={() => setAlerts(prev => ({ ...prev, cardUsage: !prev.cardUsage }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* 5. PRIVACY TAB */}
      {activeTab === "privacy" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-[#D8A63D] uppercase block font-bold">Privacy Controls</span>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 text-xs">
            {/* marketing */}
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Marketing Profiling</span>
                <span className="text-[10px] text-gray-400">Allow personalized product offerings matching algorithms</span>
              </div>
              <input
                type="checkbox"
                checked={privacy.marketing}
                onChange={() => setPrivacy(prev => ({ ...prev, marketing: !prev.marketing }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Data Sharing */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">External Data Sharing</span>
                <span className="text-[10px] text-gray-400">Share encrypted credit profiling stats with compliance agencies</span>
              </div>
              <input
                type="checkbox"
                checked={privacy.dataSharing}
                onChange={() => setPrivacy(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Cookies */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="font-bold text-white block">Strict Functional Cookies</span>
                <span className="text-[10px] text-gray-400">Save critical session preference state locally</span>
              </div>
              <input
                type="checkbox"
                checked={privacy.cookies}
                onChange={() => setPrivacy(prev => ({ ...prev, cookies: !prev.cookies }))}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Emergency quick actions panel (Always visible at the bottom) */}
      <div className="space-y-3.5 pt-4">
        <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase block font-bold">🚨 EMERGENCY HOT PANEL</span>
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleEmergencyAction("FREEZE_CARDS")}
              type="button"
              className="py-3 bg-white/5 border border-red-500/10 text-red-400 hover:bg-white/10 rounded-xl font-bold font-mono text-[10px] uppercase"
            >
              Freeze All Cards
            </button>
            <button
              onClick={() => handleEmergencyAction("FRAUD")}
              type="button"
              className="py-3 bg-white/5 border border-red-500/10 text-red-400 hover:bg-white/10 rounded-xl font-bold font-mono text-[10px] uppercase"
            >
              Report Fraud
            </button>
          </div>
          
          <button
            onClick={() => handleEmergencyAction("LOCK")}
            type="button"
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 rounded-2xl text-white font-extrabold font-mono text-[11px] uppercase tracking-wider shadow-lg"
          >
            🔒 Terminate Account & Freeze Assets Instantly
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 11. BRANCH LOCATOR (Custom Interactive SVG Map)
// =============================================================
function LocatorView({ branches, setActiveView, triggerNotification }: any) {
  const [selectedBranch, setSelectedBranch] = useState<any>(branches[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [mapMode, setMapMode] = useState<"standard" | "satellite">("standard");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("aurora_favorite_branches");
    return saved ? JSON.parse(saved) : [];
  });
  const [showDirections, setShowDirections] = useState(false);

  // Define some ATM markers in NYC (Green Markers)
  const atms = [
    {
      id: "ATM-01",
      name: "Financial District Express ATM",
      address: "1 Wall St, New York, NY 10005",
      lat: 40.7072,
      lng: -74.0115,
      phone: "N/A",
      hours: "24/7 ATM Access",
      distance: "0.2 miles away"
    },
    {
      id: "ATM-02",
      name: "Midtown West ATM Hub",
      address: "1150 Avenue of the Americas, New York, NY 10036",
      lat: 40.7562,
      lng: -73.9818,
      phone: "N/A",
      hours: "24/7 ATM Access",
      distance: "3.5 miles away"
    },
    {
      id: "ATM-03",
      name: "Central Park South Plaza ATM",
      address: "59 Central Park S, New York, NY 10019",
      lat: 40.7644,
      lng: -73.9730,
      phone: "N/A",
      hours: "24/7 ATM Access",
      distance: "4.2 miles away"
    }
  ];

  // Simulated GPS locator
  const handleLocateUser = () => {
    setIsLocating(true);
    setTimeout(() => {
      setUserLocation({ lat: 40.7128, lng: -74.0060 }); // Center of NYC
      setIsLocating(false);
      triggerNotification(
        "GPS Synchronized",
        "Your current location has been verified via cellular triangulation.",
        "Security"
      );
    }, 1200);
  };

  // Autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = [
      ...branches.map((b: any) => ({ ...b, isBranch: true })),
      ...atms.map((a: any) => ({ ...a, isATM: true }))
    ].filter(
      (item: any) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.address || "").toLowerCase().includes(q)
    );
    setSuggestions(matches);
  }, [searchQuery, branches]);

  // Handle suggestion click
  const handleSelectSuggestion = (item: any) => {
    setSelectedBranch(item);
    setSearchQuery("");
    setSuggestions([]);
    // Center map on selected item
    setMapPan({ x: 0, y: 0 });
    setMapZoom(1.3);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const isCurrentlyFav = favorites.includes(id);
    const updated = isCurrentlyFav
      ? favorites.filter(fId => fId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("aurora_favorite_branches", JSON.stringify(updated));
    triggerNotification(
      "Preference Updated",
      `${selectedBranch.name} has been ${isCurrentlyFav ? "removed from" : "saved to"} your favorites list.`,
      "Transaction"
    );
  };

  // Check if open now based on real-world system clock
  const getOperatingStatus = (hoursStr: string) => {
    if (hoursStr.includes("24/7")) return { label: "OPEN 24/7", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    // Simulated simple hour check: Tuesday 14:11 is open.
    const currentHour = new Date().getHours();
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    if (isWeekend && !hoursStr.includes("Sat")) {
      return { label: "CLOSED TODAY", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    if (currentHour >= 9 && currentHour < 17) {
      return { label: "OPEN NOW", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
    return { label: "CLOSED NOW", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
  };

  // Share branch
  const handleShareLocation = () => {
    const shareUrl = `https://aurorabank.com/locations/${selectedBranch.id || selectedBranch.name.replace(/\s+/g, "-").toLowerCase()}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`[LOCATION SHARED] Encrypted locator URL copied to clipboard:\n${shareUrl}`);
  };

  const isFav = favorites.includes(selectedBranch?.id || "");
  const statusInfo = getOperatingStatus(selectedBranch?.hours || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 flex flex-col h-full overflow-hidden pb-16 text-left"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#051126]/90 backdrop-blur-md px-6 py-4 flex items-center border-b border-white/5 z-20 shrink-0">
        <button
          onClick={() => setActiveView("home")}
          className="mr-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-black tracking-tight text-white">Branch Locator</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Search Input and Suggestions */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by city, state, country, ZIP, or name..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 mt-1 bg-[#071C3F] border border-white/10 rounded-xl max-h-48 overflow-y-auto z-30 shadow-2xl divide-y divide-white/5"
              >
                {suggestions.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-4 py-2.5 hover:bg-white/5 transition-colors text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">{item.address}</div>
                    </div>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${item.isBranch ? "text-blue-400 bg-blue-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                      {item.isBranch ? "BRANCH" : "ATM"}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vector Interactive Map */}
        <div className="relative bg-[#071C3F] border border-white/10 rounded-3xl h-64 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
          {/* Abstract SVG Manhattan Map grid */}
          <div className="absolute inset-0 select-none overflow-hidden">
            <svg
              className="w-full h-full transform transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${mapZoom}) translate(${mapPan.x}px, ${mapPan.y}px)`,
                transformOrigin: "center"
              }}
              viewBox="0 0 400 300"
            >
              {/* Rivers */}
              <path
                d="M -50,50 Q 80,120 120,350 L -50,350 Z"
                fill={mapMode === "satellite" ? "#1a2a4a" : "#0d2859"}
                className="transition-colors duration-300"
              />
              <path
                d="M 280,-50 Q 300,180 450,250 L 450,-50 Z"
                fill={mapMode === "satellite" ? "#1a2a4a" : "#0d2859"}
                className="transition-colors duration-300"
              />

              {/* Grid Roads */}
              <g stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none">
                {/* Horizontal Streets */}
                <line x1="-50" y1="50" x2="450" y2="50" />
                <line x1="-50" y1="100" x2="450" y2="100" strokeWidth="4" />
                <line x1="-50" y1="150" x2="450" y2="150" />
                <line x1="-50" y1="200" x2="450" y2="200" />
                <line x1="-50" y1="250" x2="450" y2="250" />

                {/* Vertical Avenues */}
                <line x1="80" y1="-50" x2="80" y2="350" />
                <line x1="160" y1="-50" x2="160" y2="350" strokeWidth="5" />
                <line x1="240" y1="-50" x2="240" y2="350" />
                <line x1="320" y1="-50" x2="320" y2="350" />
              </g>

              {/* Central Park Area */}
              <rect
                x="170"
                y="10"
                width="60"
                height="80"
                fill={mapMode === "satellite" ? "#143a25" : "#0c301c"}
                className="opacity-40 transition-colors duration-300"
                rx="4"
              />

              {/* Labels */}
              <text x="175" y="30" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">CENTRAL PARK</text>
              <text x="100" y="90" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="monospace" transform="rotate(90 100 90)">FIFTH AVENUE</text>
              <text x="10" y="145" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="monospace">BROADWAY</text>

              {/* User location dot */}
              {userLocation && (
                <g>
                  <circle cx="210" cy="160" r="10" fill="rgba(37, 99, 235, 0.2)" />
                  <circle cx="210" cy="160" r="4" fill="#2563EB" stroke="#fff" strokeWidth="1.5" />
                </g>
              )}

              {/* Branch Markers (Blue) */}
              {branches.map((b: any, i: number) => {
                const cx = i === 0 ? 120 : i === 1 ? 260 : 150;
                const cy = i === 0 ? 210 : i === 1 ? 120 : 270;
                const isSelected = selectedBranch?.id === b.id;
                return (
                  <g key={b.id} className="cursor-pointer" onClick={() => setSelectedBranch(b)}>
                    {isSelected && <circle cx={cx} cy={cy} r="14" fill="rgba(59, 130, 246, 0.25)" className="animate-ping" />}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="7"
                      fill={isSelected ? "#2563EB" : "#3B82F6"}
                      stroke="#071C3F"
                      strokeWidth="1.5"
                    />
                    <path
                      d={`M ${cx} ${cy - 4} L ${cx - 3} ${cy - 9} L ${cx + 3} ${cy - 9} Z`}
                      fill={isSelected ? "#2563EB" : "#3B82F6"}
                    />
                  </g>
                );
              })}

              {/* ATM Markers (Green) */}
              {atms.map((a: any, i: number) => {
                const cx = i === 0 ? 155 : i === 1 ? 245 : 190;
                const cy = i === 0 ? 220 : i === 1 ? 140 : 105;
                const isSelected = selectedBranch?.id === a.id;
                return (
                  <g key={a.id} className="cursor-pointer" onClick={() => setSelectedBranch(a)}>
                    {isSelected && <circle cx={cx} cy={cy} r="14" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" />}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill={isSelected ? "#059669" : "#10B981"}
                      stroke="#071C3F"
                      strokeWidth="1.5"
                    />
                    <path
                      d={`M ${cx} ${cy - 3} L ${cx - 2.5} ${cy - 7.5} L ${cx + 2.5} ${cy - 7.5} Z`}
                      fill={isSelected ? "#059669" : "#10B981"}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Zoom Controls */}
          <div className="z-10 flex flex-col gap-1.5 self-end">
            <button
              type="button"
              onClick={() => setMapZoom(z => Math.min(2.5, z + 0.25))}
              className="w-8 h-8 rounded-lg bg-[#051126]/90 border border-white/10 text-white flex items-center justify-center font-bold text-sm hover:bg-white/10 cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setMapZoom(z => Math.max(0.75, z - 0.25))}
              className="w-8 h-8 rounded-lg bg-[#051126]/90 border border-white/10 text-white flex items-center justify-center font-bold text-sm hover:bg-white/10 cursor-pointer"
            >
              -
            </button>
          </div>

          <div className="z-10 flex justify-between items-center w-full">
            {/* View toggles */}
            <div className="flex gap-1.5 bg-[#051126]/95 p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setMapMode("standard")}
                className={`px-2.5 py-1 text-[8px] font-mono rounded font-bold uppercase cursor-pointer border-0 ${mapMode === "standard" ? "bg-[#2563EB] text-white" : "text-gray-400"}`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapMode("satellite")}
                className={`px-2.5 py-1 text-[8px] font-mono rounded font-bold uppercase cursor-pointer border-0 ${mapMode === "satellite" ? "bg-[#2563EB] text-white" : "text-gray-400"}`}
              >
                Satellite
              </button>
            </div>

            {/* Locate Me Trigger */}
            <button
              type="button"
              onClick={handleLocateUser}
              disabled={isLocating}
              className="px-3 py-1.5 rounded-lg bg-[#051126]/95 border border-white/10 text-white hover:bg-white/10 flex items-center gap-1.5 text-[9px] font-mono uppercase cursor-pointer"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${userLocation ? "bg-blue-400" : "bg-gray-500"} ${isLocating ? "animate-ping" : ""}`} />
              <span>{isLocating ? "Triangulating..." : "Locate Me"}</span>
            </button>
          </div>
        </div>

        {/* Selected Location Information Card */}
        {selectedBranch && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${selectedBranch.id.startsWith("BR") ? "text-blue-400 bg-blue-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                    {selectedBranch.id.startsWith("BR") ? "BRANCH LOUNGE" : "SECURE ATM"}
                  </span>
                  {favorites.includes(selectedBranch.id) && (
                    <Star className="w-3.5 h-3.5 fill-[#D8A63D] text-[#D8A63D]" />
                  )}
                </div>
                <div className="text-base font-bold text-white tracking-tight">{selectedBranch.name}</div>
                <div className="text-[10px] text-gray-400 leading-relaxed font-mono">{selectedBranch.address}</div>
              </div>

              <div className="text-right space-y-1.5">
                <span className="text-[9px] font-mono font-extrabold text-[#D8A63D] uppercase bg-[#D8A63D]/10 border border-[#D8A63D]/30 px-2.5 py-1 rounded">
                  {selectedBranch.distance || "0.2 miles away"}
                </span>
                <div className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded text-center border ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-[10px] font-mono text-gray-300">
              <div>
                <span className="text-gray-500 block text-[8px] uppercase">OPERATING HOURS</span>
                <span className="text-white font-bold block mt-0.5">{selectedBranch.hours}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] uppercase">PHONE DIRECT</span>
                <span className="text-white font-bold block mt-0.5">{selectedBranch.phone !== "N/A" ? selectedBranch.phone : "No Phone Lines"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] uppercase">EMAIL CHANNEL</span>
                <span className="text-white font-bold block mt-0.5">{selectedBranch.id.startsWith("BR") ? "ny.financial@aurorabank.com" : "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[8px] uppercase">ACCESSIBILITIES</span>
                <span className="text-white font-bold block mt-0.5">Wheelchair • Parking • ATM</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block text-[8px] uppercase">AVAILABLE SERVICES</span>
                <span className="text-[#D8A63D] font-bold block mt-0.5">
                  {selectedBranch.id.startsWith("BR")
                    ? "Private Consulting, Safe Box, Instant Card Printing, Currency Pool"
                    : "High-denomination Withdrawals, Smart Deposit Envelope-Free, PIN Services"}
                </span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowDirections(true)}
                className="py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-97 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0"
              >
                <MapPin className="w-4 h-4" />
                <span>Directions</span>
              </button>

              {selectedBranch.phone !== "N/A" ? (
                <a
                  href={`tel:${selectedBranch.phone}`}
                  className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-97 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 text-center transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Branch</span>
                </a>
              ) : (
                <button
                  disabled
                  className="py-2.5 bg-white/5 opacity-40 border border-white/10 text-gray-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Branch</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleToggleFavorite(selectedBranch.id)}
                className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-97 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Star className={`w-4 h-4 ${isFav ? "fill-[#D8A63D] text-[#D8A63D]" : ""}`} />
                <span>{isFav ? "Saved" : "Favorite"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareLocation}
                className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-97 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Location</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Directions Route Modal */}
      <AnimatePresence>
        {showDirections && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-sm bg-[#071C3F] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Turn-By-Turn Route GPS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDirections(false)}
                  className="p-1 rounded bg-white/5 text-gray-400 hover:text-white border-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-mono">
                  <div className="text-gray-400 uppercase text-[9px]">Destination:</div>
                  <div className="text-white font-bold">{selectedBranch?.name}</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">{selectedBranch?.address}</div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="text-gray-400 uppercase text-[9px] mb-1">Route Instructions (Fastest):</div>
                  {[
                    "Head Northwest toward Financial St (0.1 mi)",
                    "Turn right onto Financial St (0.2 mi)",
                    "Aurora Wealth Center landmark will be on your left side"
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="w-4.5 h-4.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-gray-300 leading-normal">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDirections(false);
                  alert("[ROUTE SENT] Step-by-step route sent to your secure smartphone app via priority notification push.");
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-xs border-0 cursor-pointer"
              >
                Send Route to Device
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 12. NOTIFICATIONS
// =============================================================
function NotificationsView({ notifications, syncDB, setActiveView, triggerNotification }: any) {
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "SECURITY" | "TRANSACTION">("ALL");

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n: any) => !n.isRead);
    for (const n of unread) {
      await AuroraDB.saveNotification({
        ...n,
        isRead: true
      });
    }
    triggerNotification("Action Successful", "All security and system alerts marked as read.", "General");
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to purge all notifications from your encrypted local device storage?")) return;
    for (const n of notifications) {
      await AuroraDB.deleteNotification(n.id);
    }
    triggerNotification("Alert Logs Cleared", "All notification history has been securely purged.", "Security");
  };

  const handleMarkSingleRead = async (index: number) => {
    const target = notifications[index];
    if (target) {
      await AuroraDB.saveNotification({
        ...target,
        isRead: true
      });
    }
  };

  const handleDeleteSingle = async (index: number) => {
    const target = notifications[index];
    if (target) {
      await AuroraDB.deleteNotification(target.id);
      triggerNotification("Alert Removed", "The selected notification has been purged.", "General");
    }
  };

  // Process notifications with filters
  const processedNotifications = notifications.filter((n: any) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "SECURITY") return (n.category || "").toLowerCase() === "security" || (n.title || "").toLowerCase().includes("security") || (n.title || "").toLowerCase().includes("login");
    if (filter === "TRANSACTION") return (n.category || "").toLowerCase() === "transaction" || (n.title || "").toLowerCase().includes("transfer") || (n.title || "").toLowerCase().includes("payment") || (n.title || "").toLowerCase().includes("deposited");
    return true;
  });

  const getCategoryIconAndStyle = (n: any) => {
    const title = (n.title || "").toLowerCase();
    const category = (n.category || "").toLowerCase();
    if (category === "security" || title.includes("security") || title.includes("login") || title.includes("device")) {
      return {
        icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        style: "bg-rose-500/10 border-rose-500/20 text-rose-300",
        label: "SECURITY"
      };
    }
    if (category === "transaction" || title.includes("transfer") || title.includes("payment") || title.includes("deposited") || title.includes("spent")) {
      return {
        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
        label: "TRANSACTION"
      };
    }
    return {
      icon: <Bell className="w-4 h-4 text-blue-400" />,
      style: "bg-blue-500/10 border-blue-500/20 text-blue-300",
      label: "GENERAL"
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 flex flex-col h-full overflow-hidden pb-16 text-left"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#051126]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-20 shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => setActiveView("home")}
            className="mr-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-black tracking-tight text-white">Notifications</h2>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-3 items-center">
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] font-mono font-bold text-blue-400 hover:text-blue-300 uppercase transition-colors"
            >
              Mark Read
            </button>
            <span className="text-white/15 text-[10px] font-mono">|</span>
            <button
              onClick={handleClearAll}
              className="text-[10px] font-mono font-bold text-rose-400 hover:text-rose-300 uppercase transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-white/5 bg-[#051126]/40 shrink-0 flex gap-1.5 overflow-x-auto scrollbar-none">
        {(["ALL", "UNREAD", "SECURITY", "TRANSACTION"] as const).map((tab) => {
          const isActive = filter === tab;
          const count = tab === "ALL" 
            ? notifications.length 
            : tab === "UNREAD" 
              ? notifications.filter((n: any) => !n.isRead).length
              : tab === "SECURITY"
                ? notifications.filter((n: any) => (n.category || "").toLowerCase() === "security" || (n.title || "").toLowerCase().includes("security") || (n.title || "").toLowerCase().includes("login")).length
                : notifications.filter((n: any) => (n.category || "").toLowerCase() === "transaction" || (n.title || "").toLowerCase().includes("transfer") || (n.title || "").toLowerCase().includes("payment") || (n.title || "").toLowerCase().includes("deposited")).length;

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase whitespace-nowrap border cursor-pointer transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                  : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{tab}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${isActive ? "bg-white text-blue-600" : "bg-white/10 text-gray-300"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {processedNotifications.map((n: any, i: number) => {
            const meta = getCategoryIconAndStyle(n);
            return (
              <motion.div
                key={n.id || `${n.title}-${n.date}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className={`p-4 rounded-2xl border flex gap-3.5 text-xs leading-relaxed relative group transition-all duration-200 ${
                  n.isRead 
                    ? "bg-white/2 border-white/5 text-gray-400" 
                    : "bg-blue-900/10 border-blue-500/20 text-white shadow-md shadow-blue-500/5"
                }`}
                onClick={() => !n.isRead && handleMarkSingleRead(i)}
              >
                {/* Unread dot indicator */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                )}

                {/* Category Styled Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  {meta.icon}
                </div>

                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-mono font-black tracking-wider px-1.5 py-0.5 rounded ${meta.style}`}>
                      {meta.label}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">
                      {new Date(n.date).toLocaleDateString()} at {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`font-bold leading-tight tracking-tight ${n.isRead ? "text-gray-300" : "text-white text-sm"}`}>
                    {n.title}
                  </div>
                  <div className={`mt-1 font-mono text-[11px] leading-relaxed ${n.isRead ? "text-gray-500" : "text-gray-300"}`}>
                    {n.message}
                  </div>

                  {/* Actions Drawer */}
                  <div className="flex gap-3 mt-3 pt-3.5 border-t border-white/5">
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSingleRead(i);
                        }}
                        className="text-[9px] font-mono font-bold text-blue-400 hover:text-blue-300 uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Read</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(i);
                      }}
                      className="text-[9px] font-mono font-bold text-gray-500 hover:text-rose-400 uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {processedNotifications.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
              <BellOff className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-gray-500">No security or alert records match this filter.</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 13. SETTINGS
// =============================================================
function SettingsView({ onLogout, setActiveView, user, syncDB, triggerNotification }: any) {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("aurora_digital_settings");
    return saved
      ? JSON.parse(saved)
      : {
          pushEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
          faceIdEnabled: true,
          stealthMode: false,
          currency: "USD",
          highContrast: false,
        };
  });

  const handleToggle = (key: string) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem("aurora_digital_settings", JSON.stringify(updated));
    triggerNotification(
      "Preference Synchronized",
      `Your digital settings have been encrypted and saved.`,
      "General"
    );
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updated = { ...preferences, currency: e.target.value };
    setPreferences(updated);
    localStorage.setItem("aurora_digital_settings", JSON.stringify(updated));
    triggerNotification(
      "Base Pool Altered",
      `Primary base accounting currency changed to ${e.target.value}.`,
      "Transaction"
    );
  };

  const handleResetDatabase = async () => {
    if (!window.confirm("CRITICAL ACTION: This will erase all local modifications, custom transfers, and newly created tickets, and restore the default seed bank state. Proceed?")) return;
    try {
      const res = await fetch("/api/admin/reset-database", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Database reset failed on server.");
      }
    } catch (err: any) {
      alert(`Database reset error: ${err.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 flex flex-col h-full overflow-hidden pb-16 text-left"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#051126]/90 backdrop-blur-md px-6 py-4 flex items-center border-b border-b-white/5 z-20 shrink-0">
        <button
          onClick={() => setActiveView("home")}
          className="mr-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-black tracking-tight text-white">Digital Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-blue-900/40 to-[#0A63FF]/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D8A63D]/20 border border-[#D8A63D]/40 flex items-center justify-center text-[#D8A63D] font-black text-lg">
            {user?.name?.[0] || "A"}
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">{user?.name || "Premium Account"}</div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{user?.tier || "Aurora Wealth Tier"} • Client ID: {user?.id}</div>
          </div>
        </div>

        {/* Section: Alerts & Communication */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono font-black text-blue-400 tracking-wider uppercase">Alerts & Transmissions</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
            {[
              { key: "pushEnabled", label: "Push Notification Alerts", desc: "Real-time transfers & card swipe alerts" },
              { key: "emailEnabled", label: "Monthly Account Ledgers", desc: "Automated statement delivery to email" },
              { key: "smsEnabled", label: "SMS Authentication Fallback", desc: "Verify outbound wires via text code" }
            ].map((pref) => (
              <div key={pref.key} className="p-4 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{pref.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{pref.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(pref.key)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative border border-white/10 cursor-pointer ${
                    preferences[pref.key as keyof typeof preferences] ? "bg-blue-600" : "bg-white/5"
                  }`}
                >
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full bg-white shadow"
                    animate={{ x: preferences[pref.key as keyof typeof preferences] ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Biometrics & Security */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono font-black text-blue-400 tracking-wider uppercase">Biometrics & Access</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
            {[
              { key: "faceIdEnabled", label: "Biometric ID Recognition", desc: "Unlock checking vaults via FaceID/Fingerprint" },
              { key: "stealthMode", label: "Stealth Ledger Masking", desc: "Anonymize card numbers on main dashboards" }
            ].map((pref) => (
              <div key={pref.key} className="p-4 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{pref.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{pref.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(pref.key)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative border border-white/10 cursor-pointer ${
                    preferences[pref.key as keyof typeof preferences] ? "bg-blue-600" : "bg-white/5"
                  }`}
                >
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full bg-white shadow"
                    animate={{ x: preferences[pref.key as keyof typeof preferences] ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Regional & Accounting */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono font-black text-blue-400 tracking-wider uppercase">Regional & Currencies</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">Default Accounting Currency</div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Exchange rating index for multi-currency asset pool</div>
            </div>
            <select
              value={preferences.currency}
              onChange={handleCurrencyChange}
              className="bg-[#051126] border border-white/10 text-white rounded-xl text-xs px-3 py-2 font-mono font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        {/* Section: Developer/Diagnostics */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono font-black text-blue-400 tracking-wider uppercase">System Tools</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">Reset Application Database</div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Purge local state storage and reload default seed accounts</div>
            </div>
            <button
              type="button"
              onClick={handleResetDatabase}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 font-bold font-mono text-[9px] uppercase rounded-xl transition-all cursor-pointer"
            >
              Purge Database
            </button>
          </div>
        </div>

        {/* Termination button */}
        <button
          onClick={onLogout}
          className="w-full py-4 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:border-red-500/40 active:scale-98 transition-all cursor-pointer"
          id="logout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Terminate Secure Session</span>
        </button>
      </div>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 14. SUPPORT CENTER (Live Chat with interactive responses)
// =============================================================
function SupportView({ tickets, syncDB, user, setActiveView }: any) {
  const [tab, setTab] = useState<"chat" | "tickets">("chat");
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([
    { sender: "support", text: `Hello ${user?.name || "Alex"}! I am Sarah, your dedicated Aurora Wealth Support representative. How may I assist you with your premium card lines, transfers, or loans today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Tickets state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCat, setTicketCat] = useState("Accounts");
  const [ticketMsg, setTicketMsg] = useState("");

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const newMsg = { sender: "user", text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");
    setIsTyping(true);

    // AI Simulated Support Agent automated response logic
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Thank you for contacting Aurora priority assistance. Let me look up your customer file. How else can I guide you today?";
      const lower = userText.toLowerCase();

      if (lower.includes("card") || lower.includes("limit") || lower.includes("freeze") || lower.includes("debit") || lower.includes("credit")) {
        replyText = "I see your premium checking and credit card lines are fully active. You can set daily spending thresholds or freeze lines directly in the 'Cards' tab or let me request a permanent limit raise for you.";
      } else if (lower.includes("transfer") || lower.includes("wire") || lower.includes("send") || lower.includes("zelle")) {
        replyText = "Wire transfers are executed instantly in our server vaults. Domestic ACH wires incur zero service fees, while international wires require SWIFT validation. You can send lines via the 'Transfer' panel.";
      } else if (lower.includes("loan") || lower.includes("mortgage") || lower.includes("borrow")) {
        replyText = "Aurora credit lines offer competitive APR facilities starting from 2.8%. If you submit a new application form under the 'Loans' panel, our credit desk will review your metrics within 2 hours.";
      } else if (lower.includes("balance") || lower.includes("wealth") || lower.includes("checking") || lower.includes("saving")) {
        replyText = "Your combined checking and savings balances are fully synchronized and earn yield compounded daily on fixed deposit pools.";
      } else if (lower.includes("scam") || lower.includes("fraud") || lower.includes("stolen") || lower.includes("hack")) {
        replyText = "EMERGENCY NOTIFIED: If you suspect unauthorized access, please freeze your cards instantly from the Cards page or tap the Freeze option. I've also logged this query with our Security Ops division.";
      }

      setMessages(prev => [...prev, { sender: "support", text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMsg.trim()) {
      alert("Please fill in both the subject and detailed explanation fields.");
      return;
    }

    const newTicket: any = {
      id: `TCK-${Math.floor(1000 + Math.random()*8999)}`,
      userId: user.id,
      ticketNumber: `AUR-T-${Math.floor(1000 + Math.random()*9000)}`,
      subject: ticketSubject,
      category: ticketCat,
      status: "Open",
      createdAt: new Date().toISOString(),
      messages: [
        { sender: "user", text: ticketMsg, timestamp: new Date().toISOString() }
      ]
    };

    await AuroraDB.saveTicket(newTicket);

    alert(`[TICKET SUBMITTED] Support Case ${newTicket.ticketNumber} registered. Our Wealth concierge will respond within 2 hours.`);
    setTicketSubject("");
    setTicketMsg("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 flex flex-col h-full overflow-hidden pb-16 text-left"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#051126]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-20 shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => setActiveView("home")}
            className="mr-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-black tracking-tight text-white">Support Desk</h2>
        </div>

        <span className="text-[9px] font-mono font-bold bg-[#D8A63D]/15 border border-[#D8A63D]/20 text-[#D8A63D] px-2.5 py-1 rounded-full uppercase">
          Sarah Online
        </span>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-white/5 bg-[#051126]/40 shrink-0">
        <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab("chat")}
            className={`py-2 rounded-lg font-mono text-[10px] font-black uppercase transition-all cursor-pointer ${
              tab === "chat" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Sarah Live Chat
          </button>
          <button
            type="button"
            onClick={() => setTab("tickets")}
            className={`py-2 rounded-lg font-mono text-[10px] font-black uppercase transition-all cursor-pointer ${
              tab === "tickets" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Concierge Tickets ({tickets.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === "chat" ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Chat list messages container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-[11px] leading-relaxed font-mono ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none shadow"
                        : "bg-white/5 border border-white/10 text-gray-100 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[8px] font-mono text-gray-500 mt-1.5 px-1">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-mono italic px-2 py-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-gray-500">Sarah is compiling a response...</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendChat} className="px-6 py-4 bg-[#051126]/60 border-t border-white/5 flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Secure transmission with Sarah..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all cursor-pointer border-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Active tickets */}
            {tickets.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[9px] font-mono font-black tracking-widest text-[#D8A63D] uppercase block">Assistance Cases Log</span>
                <div className="space-y-2.5">
                  {tickets.map((t: any, i: number) => (
                    <div
                      key={t.id || i}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-bold text-white tracking-tight">{t.subject}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-1">{t.ticketNumber} • {t.category} • {new Date(t.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                        t.status === "Open" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-xs text-gray-500 font-mono">
                No tickets on record. Fill the form below to register a case.
              </div>
            )}

            {/* Create ticket form */}
            <form onSubmit={handleSubmitTicket} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-black block border-b border-white/5 pb-2">Open Assistance Case</span>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Subject Line</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  placeholder="e.g., Freeze transaction request, card issue"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Category</label>
                  <select
                    value={ticketCat}
                    onChange={e => setTicketCat(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#051126] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="Accounts">Accounts</option>
                    <option value="Cards">Cards</option>
                    <option value="Transfers">Transfers</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Explain Situation</label>
                <textarea
                  value={ticketMsg}
                  onChange={e => setTicketMsg(e.target.value)}
                  rows={4}
                  placeholder="Provide precise dates, amounts, or reasons so our underwriting desk can resolve the item immediately..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600 font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs text-white transition-all cursor-pointer active:scale-97 border-0 uppercase tracking-wider"
              >
                Submit Ticket Case
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 15. FAQ (Pages 22)
// =============================================================
function FAQView({ setActiveView }: any) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "CARDS", "TRANSFERS", "SECURITY", "WEALTH"];

  const faqs = [
    { q: "How do I temporarily freeze my card?", a: "Navigate to the Cards view, choose your card line, and click 'Freeze Card'. This instantly declines all POS, ATM, and digital transactions.", category: "CARDS" },
    { q: "How long do domestic wires take?", a: "Domestic wires within Aurora Bank occur instantly. Transfers routed externally via FedWire are credited within 30 minutes during bank hours.", category: "TRANSFERS" },
    { q: "Are my investments SIPC protected?", a: "Yes, standard checking balances carry FDIC insurance up to $250,000, while investment portfolios are cleared through SIPC custody operations.", category: "WEALTH" },
    { q: "Can I manage biometric FaceID login?", a: "Yes, you can enable FaceID, Fingerprint recognition, or change security locks inside the Digital Settings panel.", category: "SECURITY" },
    { q: "What is the daily wire transaction limit?", a: "Standard account lines carry a $100,000 daily wire limit. For corporate or high-net-worth extensions, please submit a support concierge ticket to increase it.", category: "TRANSFERS" },
    { q: "How do I dispute a fraudulent transaction?", a: "Freeze the affected card immediately, then open a Support Assistance Case or call our priority security line at +1 (212) 555-0100.", category: "SECURITY" },
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchSearch = f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 flex flex-col h-full overflow-hidden pb-16 text-left"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#051126]/90 backdrop-blur-md px-6 py-4 flex items-center border-b border-white/5 z-20 shrink-0">
        <button
          onClick={() => setActiveView("home")}
          className="mr-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-black tracking-tight text-white">Security FAQ Help</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search help database..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Category Pill Buttons */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveIdx(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[8px] font-mono font-bold tracking-wider cursor-pointer border transition-all ${
                selectedCategory === cat
                  ? "bg-[#D8A63D] border-[#D8A63D] text-[#051126]"
                  : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="space-y-2">
          {filteredFaqs.map((f, idx) => {
            const isOpen = activeIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white/2 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/5"
              >
                <button
                  type="button"
                  onClick={() => setActiveIdx(isOpen ? null : idx)}
                  className="w-full flex justify-between items-start text-left text-xs font-bold font-mono text-white tracking-tight cursor-pointer"
                >
                  <span className="leading-snug pr-4">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-[#D8A63D]" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-[11px] text-gray-400 pl-0 leading-relaxed mt-3 pt-3 border-t border-white/5 font-mono">
                        {f.a}
                      </div>
                      <div className="mt-2.5 flex justify-end">
                        <span className="text-[7px] font-mono tracking-wider text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 uppercase">
                          {f.category} Help
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16 text-xs text-gray-500 font-mono">
              No matching questions found. Ask Sarah in Support Live Chat instead.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================
// SUB-VIEW: 16. CONTACT US (Page 23)
// =============================================================
function ContactView({ setActiveView }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    preference: "Email"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please specify your name, email, and message.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`[CONCIERGE TRANSMISSION] Thank you ${formData.name}. Your offline request has been encrypted and routed. We will reach out via ${formData.preference} shortly.`);
      setFormData({ name: "", email: "", subject: "", message: "", preference: "Email" });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 flex flex-col h-full overflow-hidden pb-16 text-left"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#051126]/90 backdrop-blur-md px-6 py-4 flex items-center border-b border-white/5 z-20 shrink-0">
        <button
          onClick={() => setActiveView("home")}
          className="mr-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-black tracking-tight text-white">Contact Aurora</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Office Image Banner */}
        <div 
          className="h-36 rounded-3xl bg-cover bg-center border border-white/10 relative overflow-hidden flex items-end p-4 shadow-xl"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#051126] to-transparent opacity-90" />
          <div className="relative">
            <span className="text-[8px] font-mono tracking-widest text-[#D8A63D] uppercase font-bold">New York Center</span>
            <h3 className="text-sm font-black text-white">Aurora Financial Tower</h3>
          </div>
        </div>

        {/* Corporate details */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
          <span className="text-[9px] font-mono tracking-widest text-[#D8A63D] uppercase font-black block border-b border-white/5 pb-2">Priority Channels</span>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex gap-3">
              <Building className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-white uppercase text-[10px]">Corporate headquarters</div>
                <div className="text-gray-400 mt-1 leading-normal text-[10px]">125 Financial Street, Penthouse Floor, New York, NY 10005</div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/5 pt-4">
              <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white uppercase text-[10px]">Priority Phone hotline</div>
                <div className="text-gray-400 mt-1 leading-normal text-[10px]">+1 (212) 555-0100</div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/5 pt-4">
              <Mail className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-white uppercase text-[10px]">Concierge client desk</div>
                <div className="text-gray-400 mt-1 leading-normal text-[10px]">priority@aurorabank.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-black block border-b border-white/5 pb-2">Inquire Offline</span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Subject Of Inquiry</label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Asset planning consulting"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Message Details</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              placeholder="Inquire about custom wealth consulting, safe vault line access, etc."
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600 leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Preferred Return Contact</label>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
              {["Email", "Phone", "SMS"].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setFormData({ ...formData, preference: method })}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all border-0 cursor-pointer ${
                    formData.preference === method ? "bg-[#D8A63D] text-[#051126]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-97 border-0 uppercase tracking-wider disabled:opacity-40"
          >
            {isSubmitting ? "Routing to Concierge..." : "Transmit Inquiry"}
          </button>
        </form>

        {/* Social Links */}
        <div className="flex justify-center gap-6 text-gray-400 py-3 border-t border-white/5 shrink-0">
          <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
        </div>
      </div>
    </motion.div>
  );
}
