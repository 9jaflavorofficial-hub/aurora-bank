/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Lock,
  ChevronLeft,
  Users,
  Wallet,
  TrendingUp,
  Activity,
  FileCheck,
  Check,
  X,
  AlertCircle,
  FolderOpen,
  DollarSign,
  Download,
  Search,
  Database,
  ArrowRight,
  ShieldAlert,
  Edit,
  Trash2,
  LockKeyhole,
  CheckSquare,
  Settings
} from "lucide-react";
import { AuroraDB } from "../db/mockDb";
import { LoanStatus, AccountStatus, CardStatus, CardType } from "../types";
import { generateDemoProfile } from "../db/demoGenerator";

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardRoute = location.pathname.toLowerCase().replace(/\/$/, "").includes("/admin/dashboard");

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("aurora_admin_logged_in") === "true";
  });
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  // Admin Dashboard State
  const [dbState, setDbState] = useState<any>(null);
  const [subView, setSubView] = useState<"dashboard" | "users" | "loans" | "transfers" | "audit">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isHiddenLinkLocked, setIsHiddenLinkLocked] = useState(() => {
    return localStorage.getItem("aurora_hidden_link_locked") === "true";
  });

  // Selected user for editing
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userTab, setUserTab] = useState<"profile" | "accounts" | "cards" | "transactions" | "notifications">("profile");

  // Profile Edit State
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Suspended" | "Locked">("Active");
  const [editEmployment, setEditEmployment] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNextOfKin, setEditNextOfKin] = useState("");
  const [editPreferredCurrency, setEditPreferredCurrency] = useState("USD");
  const [editAppPin, setEditAppPin] = useState("");
  const [editTransactionPin, setEditTransactionPin] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editProfilePic, setEditProfilePic] = useState("");

  // Card Management State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardNo, setEditCardNo] = useState("");
  const [editCardExpiry, setEditCardExpiry] = useState("");
  const [editCardCvv, setEditCardCvv] = useState("");
  const [editCardType, setEditCardType] = useState("Debit Card");
  const [editCardStatus, setEditCardStatus] = useState("Active");
  const [editCardPin, setEditCardPin] = useState("0000");
  const [editCardLimit, setEditCardLimit] = useState<number>(5000);
  const [editCardSpent, setEditCardSpent] = useState<number>(0);
  const [editCardAccount, setEditCardAccount] = useState("");

  // Demo Customer Generator State
  const [showDemoGenForm, setShowDemoGenForm] = useState(false);
  const [demoEmployer, setDemoEmployer] = useState("NexusTech Solutions");
  const [demoSalary, setDemoSalary] = useState<number>(7500);
  const [demoDepositDay, setDemoDepositDay] = useState<number>(15);
  const [demoIsMilitary, setDemoIsMilitary] = useState(false);
  const [demoFirstName, setDemoFirstName] = useState("");
  const [demoLastName, setDemoLastName] = useState("");

  // Add Account State
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAccType, setNewAccType] = useState("Checking Account");
  const [newAccBalance, setNewAccBalance] = useState<number>(1000);
  const [newAccCurrency, setNewAccCurrency] = useState("USD");

  // Edit Balance State
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [balanceEditType, setBalanceEditType] = useState<"set" | "add" | "sub">("set");
  const [balanceEditValue, setBalanceEditValue] = useState<number>(0);

  // Edit Account Details State
  const [editingFullAccId, setEditingFullAccId] = useState<string | null>(null);
  const [editAccNumber, setEditAccNumber] = useState("");
  const [editAccType, setEditAccType] = useState("");
  const [editAccCurrency, setEditAccCurrency] = useState("");
  const [editAccStatus, setEditAccStatus] = useState<"Active" | "Frozen" | "Suspended" | "Closed">("Active");

  // Add Transaction State
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [newTxnAccId, setNewTxnAccId] = useState("");
  const [newTxnAmount, setNewTxnAmount] = useState<number>(100);
  const [newTxnCategory, setNewTxnCategory] = useState("Shopping");
  const [newTxnMerchant, setNewTxnMerchant] = useState("");
  const [newTxnDesc, setNewTxnDesc] = useState("");
  const [newTxnStatus, setNewTxnStatus] = useState("Completed");
  const [newTxnDate, setNewTxnDate] = useState(new Date().toISOString().substring(0, 16));

  // Edit Transaction State
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [editTxnAccId, setEditTxnAccId] = useState("");
  const [editTxnAmount, setEditTxnAmount] = useState<number>(0);
  const [editTxnCategory, setEditTxnCategory] = useState("Shopping");
  const [editTxnMerchant, setEditTxnMerchant] = useState("");
  const [editTxnDesc, setEditTxnDesc] = useState("");
  const [editTxnStatus, setEditTxnStatus] = useState("Completed");
  const [editTxnDate, setEditTxnDate] = useState("");

  // Add Notification State
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [newNotifTitle, setNewNotifTitle] = useState("");
  const [newNotifMsg, setNewNotifMsg] = useState("");
  const [newNotifCategory, setNewNotifCategory] = useState("General");
  const [notifSendTo, setNotifSendTo] = useState<"single" | "all">("single");

  const syncState = () => {
    const s = AuroraDB.getState();
    setDbState(s);
  };

  useEffect(() => {
    syncState();
  }, [isAdminLoggedIn, subView]);

  useEffect(() => {
    const handleUpdate = () => {
      syncState();
    };
    window.addEventListener("aurora_db_updated", handleUpdate);
    return () => {
      window.removeEventListener("aurora_db_updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("aurora_admin_logged_in") === "true";
    if (isDashboardRoute && !loggedIn) {
      navigate("/admin");
    } else if (!isDashboardRoute && loggedIn) {
      navigate("/admin/dashboard");
    }
  }, [location.pathname, navigate, isDashboardRoute]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername.trim(), password: adminPassword })
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        setError("This connection was intercepted by the preview security gateway. Please open the app in a New Tab (top-right of the screen) to authorize access.");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid administrative credentials.");
        return;
      }

      setIsAdminLoggedIn(true);
      sessionStorage.setItem("aurora_admin_logged_in", "true");
      sessionStorage.setItem("aurora_admin_token", data.token);
      setError("");
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Admin Login Caught Error:", err);
      setError(`Administrative gateway offline. Please try again. (Error: ${err.message || err}${err.stack ? " - " + err.stack.split("\n")[0] : ""})`);
    }
  };

  // =========================================================
  // ACTIONS - USER MANAGEMENT
  // =========================================================
  const handleSelectUser = (u: any) => {
    setSelectedUserId(u.id);
    setUserTab("profile");
    setEditFirstName(u.firstName || "");
    setEditLastName(u.lastName || "");
    setEditEmail(u.email || "");
    setEditPhone(u.phone || "");
    setEditUsername(u.username || "");
    setEditStatus(u.status || "Active");
    setEditEmployment(u.employment || "");
    setEditAddress(u.address || "");
    setEditNextOfKin(u.nextOfKin || "");
    setEditPreferredCurrency(u.preferredCurrency || "USD");
    setEditAppPin(u.appPin || "");
    setEditTransactionPin(u.transactionPin || "");
    setEditPassword("");
    setEditDob(u.dob || "1992-08-15");
    setEditProfilePic(u.profilePic || "");

    // Reset details sub-states
    setShowAddAcc(false);
    setEditingAccId(null);
    setEditingFullAccId(null);
    setShowAddTxn(false);
    setShowAddNotif(false);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      alert("First and Last name are required.");
      return;
    }
    const state = AuroraDB.getState();
    const userIdx = state.users.findIndex((u: any) => u.id === selectedUserId);
    if (userIdx !== -1) {
      const oldUser = state.users[userIdx];
      
      // Keep password and login PIN perfectly unified
      let finalAppPin = editAppPin;
      let finalPassword = oldUser.password;

      if (editPassword.trim()) {
        finalPassword = editPassword.trim();
        finalAppPin = editPassword.trim();
      } else if (editAppPin !== oldUser.appPin) {
        finalPassword = editAppPin;
        finalAppPin = editAppPin;
      }

      const updatedUser = {
        ...oldUser,
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        username: editUsername,
        status: editStatus as any,
        employment: editEmployment,
        address: editAddress,
        nextOfKin: editNextOfKin,
        preferredCurrency: editPreferredCurrency,
        appPin: finalAppPin,
        transactionPin: editTransactionPin,
        dob: editDob,
        profilePic: editProfilePic,
        password: finalPassword
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Update User Info",
        details: `Updated info and credentials for ${editFirstName} ${editLastName} (${selectedUserId})`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveUser(updatedUser);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert("User profile details successfully saved!");
    }
  };

  const handleDeleteAccount = async (accId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete account ${accId}? This will also delete its history.`)) return;
    const account = AuroraDB.getState().accounts.find((a: any) => a.id === accId);
    if (account) {
      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Delete Bank Account",
        details: `Deleted ${account.type} (${accId}) for User ID ${selectedUserId}`,
        date: new Date().toISOString()
      };

      await AuroraDB.deleteAccount(accId);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`Account ${accId} has been successfully deleted.`);
    }
  };

  const handleToggleFreezeAccount = async (acc: any) => {
    const account = AuroraDB.getState().accounts.find((a: any) => a.id === acc.id);
    if (account) {
      const isFrozen = account.status === "Frozen";
      const updatedAccount = {
        ...account,
        status: (isFrozen ? "Active" : "Frozen") as any
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: isFrozen ? "Unfreeze Account" : "Freeze Account",
        details: `${isFrozen ? "Unfroze" : "Froze"} bank account ${acc.id} for customer profile ${selectedUserId}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveAccount(updatedAccount);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`Account ${acc.id} is now successfully set to ${updatedAccount.status}.`);
    }
  };

  const handleAddAccount = async () => {
    if (newAccBalance < 0) {
      alert("Initial balance cannot be negative.");
      return;
    }
    const newId = `ACC-${Math.floor(5000 + Math.random()*4999)}`;
    const randomDigits = Math.floor(1000 + Math.random()*9000);
    const newAcc: any = {
      id: newId,
      userId: selectedUserId,
      accountNumber: `•••• •••• ${randomDigits}`,
      type: newAccType as any,
      balance: Number(newAccBalance),
      currency: newAccCurrency,
      status: "Active" as any,
      createdAt: new Date().toISOString()
    };

    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Create Bank Account",
      details: `Created new ${newAccType} (${newId}) with balance ${newAccCurrency} ${newAccBalance.toLocaleString()} for User ID ${selectedUserId}`,
      date: new Date().toISOString()
    };

    await AuroraDB.saveAccount(newAcc);
    await AuroraDB.saveAuditLog(log);
    syncState();
    setShowAddAcc(false);
    setNewAccBalance(1000);
    alert(`Account ${newId} created successfully!`);
  };

  const handleEditBalance = async () => {
    const account = AuroraDB.getState().accounts.find((a: any) => a.id === editingAccId);
    if (account) {
      const oldBalance = account.balance;
      let newBalance = oldBalance;

      if (balanceEditType === "set") {
        newBalance = Number(balanceEditValue);
      } else if (balanceEditType === "add") {
        newBalance = oldBalance + Number(balanceEditValue);
      } else if (balanceEditType === "sub") {
        newBalance = oldBalance - Number(balanceEditValue);
      }

      const updatedAccount = {
        ...account,
        balance: newBalance
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Adjust Account Balance",
        details: `Adjusted balance of ${editingAccId} from $${oldBalance.toLocaleString()} to $${newBalance.toLocaleString()}.`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveAccount(updatedAccount);
      await AuroraDB.saveAuditLog(log);
      syncState();
      setEditingAccId(null);
      setBalanceEditValue(0);
      alert(`Balance successfully updated to ${account.currency} ${newBalance.toLocaleString()}!`);
    }
  };

  const handleDeleteTransaction = async (txnId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete transaction ${txnId}?`)) return;
    const state = AuroraDB.getState();
    const txn = state.transactions.find((t: any) => t.id === txnId);
    if (txn) {
      // Revert account balance
      const account = state.accounts.find((a: any) => a.id === txn.accountId);
      if (account) {
        const updatedAccount = {
          ...account,
          balance: account.balance - txn.amount
        };
        await AuroraDB.saveAccount(updatedAccount);
      }
      
      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Delete Transaction",
        details: `Deleted transaction ${txnId} of $${txn.amount} from account ${txn.accountId}. Adjusted account balance accordingly.`,
        date: new Date().toISOString()
      };

      await AuroraDB.deleteTransaction(txnId);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`Transaction ${txnId} deleted successfully and account balance adjusted.`);
    }
  };

  const handleStartEditTransaction = (txn: any) => {
    setEditingTxnId(txn.id);
    setEditTxnAccId(txn.accountId);
    setEditTxnAmount(txn.amount);
    setEditTxnCategory(txn.category);
    setEditTxnMerchant(txn.merchant);
    setEditTxnDesc(txn.description);
    setEditTxnStatus(txn.status || "Completed");
    setEditTxnDate(new Date(txn.date).toISOString().substring(0, 16));
  };

  const handleSaveTransaction = async () => {
    if (!editTxnMerchant.trim() || !editTxnDesc.trim()) {
      alert("Merchant and description are required.");
      return;
    }
    const state = AuroraDB.getState();
    const txn = state.transactions.find((t: any) => t.id === editingTxnId);
    if (txn) {
      const oldAmount = txn.amount;
      const newAmount = Number(editTxnAmount);
      const diff = newAmount - oldAmount;

      // Adjust account balance if necessary
      const account = state.accounts.find((a: any) => a.id === txn.accountId);
      if (account && diff !== 0) {
        const updatedAccount = {
          ...account,
          balance: account.balance + diff
        };
        await AuroraDB.saveAccount(updatedAccount);
      }

      const updatedTxn = {
        ...txn,
        amount: newAmount,
        category: editTxnCategory as any,
        merchant: editTxnMerchant,
        description: editTxnDesc,
        status: editTxnStatus as any,
        date: new Date(editTxnDate).toISOString()
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Edit Transaction",
        details: `Edited transaction ${editingTxnId}. Prev Amount: $${oldAmount}, New Amount: $${newAmount}. Adjusted account balance by $${diff}.`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveTransaction(updatedTxn);
      await AuroraDB.saveAuditLog(log);
      syncState();
      setEditingTxnId(null);
      alert(`Transaction ${editingTxnId} edited successfully.`);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    if (!window.confirm("Are you sure you want to delete this notification log?")) return;
    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Delete Notification",
      details: `Deleted notification ID: ${notifId}`,
      date: new Date().toISOString()
    };

    await AuroraDB.deleteNotification(notifId);
    await AuroraDB.saveAuditLog(log);
    syncState();
    alert("Notification log deleted successfully.");
  };

  const handleStartEditAccountDetails = (acc: any) => {
    setEditingFullAccId(acc.id);
    setEditAccNumber(acc.accountNumber);
    setEditAccType(acc.type);
    setEditAccCurrency(acc.currency);
    setEditAccStatus(acc.status || "Active");
  };

  const handleSaveAccountDetails = async () => {
    if (!editAccNumber.trim()) {
      alert("Account number is required.");
      return;
    }
    const account = AuroraDB.getState().accounts.find((a: any) => a.id === editingFullAccId);
    if (account) {
      const prevDetails = `Num: ${account.accountNumber}, Type: ${account.type}, Cur: ${account.currency}, Status: ${account.status}`;
      const updatedAccount = {
        ...account,
        accountNumber: editAccNumber,
        type: editAccType as any,
        currency: editAccCurrency,
        status: editAccStatus as any
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Edit Account Details",
        details: `Edited account ${editingFullAccId} details. Prev: [${prevDetails}]. New: [Num: ${editAccNumber}, Type: ${editAccType}, Cur: ${editAccCurrency}, Status: ${editAccStatus}]`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveAccount(updatedAccount);
      await AuroraDB.saveAuditLog(log);
      syncState();
      setEditingFullAccId(null);
      alert("Account details successfully updated!");
    }
  };

  const handleAddTransaction = async () => {
    if (!newTxnAccId) {
      alert("Please specify a target account.");
      return;
    }
    if (!newTxnMerchant.trim() || !newTxnDesc.trim()) {
      alert("Merchant and description are required.");
      return;
    }

    const account = AuroraDB.getState().accounts.find((a: any) => a.id === newTxnAccId);
    if (!account) {
      alert("Target account not found.");
      return;
    }

    const txnAmount = Number(newTxnAmount);
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 89999)}`;
    const newTxn: any = {
      id: txnId,
      userId: selectedUserId,
      accountId: newTxnAccId,
      amount: txnAmount,
      category: newTxnCategory as any,
      merchant: newTxnMerchant,
      description: newTxnDesc,
      date: new Date(newTxnDate).toISOString(),
      status: newTxnStatus as any,
      referenceNumber: `TXN${Math.floor(100000 + Math.random()*900000)}`
    };

    const updatedAccount = {
      ...account,
      balance: account.balance + txnAmount
    };

    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Insert Transaction Entry",
      details: `Added transaction ${txnId} of $${txnAmount.toLocaleString()} to ${newTxnAccId}. Balance: $${account.balance.toLocaleString()} -> $${updatedAccount.balance.toLocaleString()}`,
      date: new Date().toISOString()
    };

    await AuroraDB.saveTransaction(newTxn);
    await AuroraDB.saveAccount(updatedAccount);
    await AuroraDB.saveAuditLog(log);
    syncState();
    setShowAddTxn(false);
    setNewTxnMerchant("");
    setNewTxnDesc("");
    setNewTxnAmount(100);
    alert("Transaction added and account balance automatically updated!");
  };

  const handleAddNotification = async () => {
    if (!newNotifTitle.trim() || !newNotifMsg.trim()) {
      alert("Title and message are required.");
      return;
    }

    const state = AuroraDB.getState();

    if (notifSendTo === "all") {
      const promises = state.users.map(async (u: any) => {
        const notifId = `NOTIF-${Math.floor(100000 + Math.random()*900000)}`;
        return AuroraDB.saveNotification({
          id: notifId,
          userId: u.id,
          title: newNotifTitle,
          message: newNotifMsg,
          category: newNotifCategory as any,
          date: new Date().toISOString(),
          isRead: false
        });
      });

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Broadcast Notification",
        details: `Broadcasted message "${newNotifTitle}" to all registered users (${state.users.length} users)`,
        date: new Date().toISOString()
      };

      await Promise.all(promises);
      await AuroraDB.saveAuditLog(log);
      syncState();
      setShowAddNotif(false);
      setNewNotifTitle("");
      setNewNotifMsg("");
      alert(`Broadcast notification sent to all ${state.users.length} user dashboards!`);
    } else {
      const notifId = `NOTIF-${Math.floor(100000 + Math.random()*900000)}`;
      const newNotif: any = {
        id: notifId,
        userId: selectedUserId,
        title: newNotifTitle,
        message: newNotifMsg,
        category: newNotifCategory as any,
        date: new Date().toISOString(),
        isRead: false
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Dispatch Notification",
        details: `Dispatched message "${newNotifTitle}" to User ID ${selectedUserId}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveNotification(newNotif);
      await AuroraDB.saveAuditLog(log);
      syncState();
      setShowAddNotif(false);
      setNewNotifTitle("");
      setNewNotifMsg("");
      alert("Notification sent to user dashboard!");
    }
  };

  // =========================================================
  // ACTIONS
  // =========================================================
  const handleApproveLoan = async (loanId: string) => {
    const state = AuroraDB.getState();
    const loan = state.loans.find((l: any) => l.id === loanId);
    if (loan) {
      const updatedLoan = {
        ...loan,
        status: LoanStatus.APPROVED
      };
      await AuroraDB.saveLoan(updatedLoan);
      
      // Credit user's Checking Account
      const checkingAcc = state.accounts.find((a: any) => a.userId === loan.userId && a.type === "Checking Account");
      if (checkingAcc) {
        const updatedAcc = {
          ...checkingAcc,
          balance: checkingAcc.balance + loan.amount
        };
        await AuroraDB.saveAccount(updatedAcc);
        
        // Add transaction entry
        await AuroraDB.saveTransaction({
          id: `TXN-${Math.floor(10000 + Math.random() * 89999)}`,
          userId: loan.userId,
          accountId: checkingAcc.id,
          amount: loan.amount,
          category: "Loan" as any,
          merchant: "Aurora Capital Group",
          description: `Disbursed Principal for ${loan.type}`,
          date: new Date().toISOString(),
          status: "Completed" as any,
          referenceNumber: `LN${Math.floor(100000 + Math.random()*900000)}`
        });

        // Add user notification
        await AuroraDB.saveNotification({
          id: `NOTIF-${Math.random()}`,
          userId: loan.userId,
          title: "Loan Facility Approved",
          message: `Your ${loan.type} for $${loan.amount.toLocaleString()} was approved. Credit has been deposited.`,
          category: "Transaction" as any,
          date: new Date().toISOString(),
          isRead: false
        });
      }

      // Add Admin Audit Log
      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Approve Loan",
        details: `Approved loan of $${loan.amount} for user ID ${loan.userId}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveAuditLog(log);
      syncState();
      alert("[LOAN APPROVED] Facility disbursed & user checking balance updated in real-time!");
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    const state = AuroraDB.getState();
    const loan = state.loans.find((l: any) => l.id === loanId);
    if (loan) {
      const updatedLoan = {
        ...loan,
        status: LoanStatus.REJECTED
      };
      await AuroraDB.saveLoan(updatedLoan);

      await AuroraDB.saveNotification({
        id: `NOTIF-${Math.random()}`,
        userId: loan.userId,
        title: "Loan Facility Rejected",
        message: `Your application for ${loan.type} of $${loan.amount.toLocaleString()} was declined after evaluation.`,
        category: "Security" as any,
        date: new Date().toISOString(),
        isRead: false
      });

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Decline Loan",
        details: `Declined loan of $${loan.amount} for user ID ${loan.userId}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveAuditLog(log);
      syncState();
      alert("[LOAN REJECTED] Application status updated successfully.");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const state = AuroraDB.getState();
    const user = state.users.find((u: any) => u.id === userId);
    if (user) {
      const newStatus = user.status === "Active" ? "Suspended" : "Active";
      const updatedUser = {
        ...user,
        status: newStatus as any
      };
      await AuroraDB.saveUser(updatedUser);
      
      // If user suspended, freeze all their accounts
      const accPromises = state.accounts
        .filter((a: any) => a.userId === userId)
        .map(async (a: any) => {
          return AuroraDB.saveAccount({
            ...a,
            status: newStatus === "Active" ? AccountStatus.ACTIVE : AccountStatus.FROZEN
          });
        });

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: newStatus === "Suspended" ? "Suspend Customer" : "Activate Customer",
        details: `${newStatus === "Suspended" ? "Suspended" : "Activated"} User: ${user.firstName} ${user.lastName} (${user.id})`,
        date: new Date().toISOString()
      };

      await Promise.all(accPromises);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`[USER STATE SUCCESS] Customer profile set to ${newStatus}.`);
    }
  };

  const handleCreateCustomer = async () => {
    const mockId = `AUR-${Math.floor(100000 + Math.random()*900000)}`;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let generatedPass = "";
    for (let i = 0; i < 10; i++) {
      generatedPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const mockUsername = `mockuser_${Math.floor(100 + Math.random()*899)}`;
    const newCust: any = {
      id: mockId,
      username: mockUsername,
      firstName: "Test",
      lastName: "Customer",
      email: `${mockUsername}@gmail.com`,
      phone: "+1 555-0100",
      joinedAt: new Date().toISOString(),
      status: "Active",
      password: generatedPass,
      appPin: "111111",
      transactionPin: "1111",
      biometricsEnabled: { faceId: true, fingerprint: true },
      securityQuestion: "What is your pet name?",
      securityAnswer: "Bella"
    };

    const newAcc: any = {
      id: `ACC-${Math.floor(5000 + Math.random()*4999)}`,
      userId: mockId,
      accountNumber: `•••• •••• ${Math.floor(1000 + Math.random()*9000)}`,
      type: "Checking Account",
      balance: 5000,
      currency: "USD",
      status: "Active",
      createdAt: new Date().toISOString()
    };

    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Create Customer",
      details: `Created new mock user profile for ${newCust.firstName} (${newCust.id}) with password "${generatedPass}"`,
      date: new Date().toISOString()
    };

    await AuroraDB.saveUser(newCust);
    await AuroraDB.saveAccount(newAcc);
    await AuroraDB.saveAuditLog(log);
    syncState();
    alert(`[CUSTOMER CREATED]\n\nUser ID: ${mockId}\nUsername: ${mockUsername}\nPassword: ${generatedPass}\n\nThis user is ready to log in immediately!`);
  };

  const handleGenerateDemoCustomer = async () => {
    try {
      const res = await fetch("/api/admin/generate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerName: demoEmployer,
          salaryAmount: demoSalary,
          depositDay: demoDepositDay,
          isMilitary: demoIsMilitary,
          firstName: demoFirstName || undefined,
          lastName: demoLastName || undefined
        })
      });

      if (!res.ok) {
        throw new Error("Server failed to generate customer.");
      }

      const data = await res.json();
      syncState();
      setShowDemoGenForm(false);
      
      alert(`[DEMO CUSTOMER GENERATED]\n\nCustomer ID: ${data.userId}\nUsername: ${data.username}\nPassword: ${data.password}\n\nThis customer has been generated with Checking & Savings accounts, Debit & Credit cards, and a complete, mathematically consistent monthly transaction history (Jan 2017 to Aug 2024)!\n\nThis customer can log in immediately with their username/ID and password!`);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    }
  };

  const handleGenerateMilitaryCustomer = async () => {
    try {
      const mockId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
      const mockUsername = `ibarra_military_${Math.floor(100 + Math.random() * 900)}`;
      const generatedPass = "Military2026!";

      const res = await fetch("/api/admin/generate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: mockId,
          username: mockUsername,
          password: generatedPass,
          firstName: "IBARRA RODRIGUEZ",
          lastName: "ELIZABETH",
          email: `ibarra_rodriguez_elizabeth_mil_${Math.floor(100 + Math.random() * 900)}@demo-aurorabank.com`,
          phone: `+1 555-01${Math.floor(100 + Math.random() * 899)}`,
          address: "982 Autumn Maple Court, Miami, FL 33101",
          dob: "1986-05-22",
          employment: "Master Chief (Department of Defense)",
          employerName: "Department of Defense",
          salaryAmount: 7500,
          depositDay: 1,
          isMilitary: true
        })
      });

      if (!res.ok) {
        throw new Error("Server failed to generate military customer.");
      }

      const data = await res.json();
      syncState();
      
      alert(`[MILITARY CUSTOMER GENERATED]\n\nCustomer ID: ${data.userId}\nUsername: ${data.username}\nPassword: ${data.password}\n\nThis premium military customer has been generated with Checking & Savings accounts, Debit & Credit cards, and a complete, mathematically consistent transaction history (Jan 2017 to date) with ONLY Military Salary Deposits from Jan 2024 onwards!\n\nThis customer can log in immediately with their username or ID and password!`);
    } catch (err: any) {
      alert(`Military generation failed: ${err.message}`);
    }
  };

  const handleSaveCardDetails = async (cardId: string) => {
    const card = AuroraDB.getState().cards.find((c: any) => c.id === cardId);
    if (card) {
      const updatedCard = {
        ...card,
        cardNumber: editCardNo,
        expiryDate: editCardExpiry,
        cvv: editCardCvv,
        type: editCardType as any,
        status: editCardStatus as any,
        pin: editCardPin,
        dailyLimit: Number(editCardLimit),
        spentToday: Number(editCardSpent),
        accountId: editCardAccount
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Edit Card Details",
        details: `Edited details for card ID ${cardId} (Ending in ${editCardNo.slice(-4)})`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveCard(updatedCard);
      await AuroraDB.saveAuditLog(log);
      syncState();
      setEditingCardId(null);
      alert("Card details successfully updated and synchronized in real-time!");
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    const state = AuroraDB.getState();
    const cardPromises = state.cards
      .filter((c: any) => c.userId === selectedUserId)
      .map(async (c: any) => {
        return AuroraDB.saveCard({
          ...c,
          isDefault: c.id === cardId
        });
      });

    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Set Default Card",
      details: `Set card ID ${cardId} as default card for user ${selectedUserId}`,
      date: new Date().toISOString()
    };

    await Promise.all(cardPromises);
    await AuroraDB.saveAuditLog(log);
    syncState();
    alert("Card successfully set as default!");
  };

  const handleToggleFreezeCard = async (cardId: string) => {
    const card = AuroraDB.getState().cards.find((c: any) => c.id === cardId);
    if (card) {
      const updatedCard = {
        ...card,
        status: card.status === CardStatus.FROZEN ? CardStatus.ACTIVE : CardStatus.FROZEN
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Toggle Card Freeze",
        details: `Toggled freeze state for card ID ${cardId}. New status: ${updatedCard.status}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveCard(updatedCard);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`Card status is now ${(updatedCard.status || "").toLowerCase()}!`);
    }
  };

  const handleToggleActiveCard = async (cardId: string) => {
    const card = AuroraDB.getState().cards.find((c: any) => c.id === cardId);
    if (card) {
      const updatedCard = {
        ...card,
        status: card.status === CardStatus.ACTIVE ? CardStatus.REPLACED : CardStatus.ACTIVE
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Toggle Card Active Status",
        details: `Toggled active state for card ID ${cardId}. New status: ${updatedCard.status}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveCard(updatedCard);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`Card status is now ${(updatedCard.status || "").toLowerCase()}!`);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to permanently delete this card?")) return;
    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Delete Card",
      details: `Permanently deleted card ID ${cardId}`,
      date: new Date().toISOString()
    };

    await AuroraDB.deleteCard(cardId);
    await AuroraDB.saveAuditLog(log);
    syncState();
    alert("Card successfully deleted and removed from user database!");
  };

  const handleReplaceCard = async (cardId: string) => {
    const card = AuroraDB.getState().cards.find((c: any) => c.id === cardId);
    if (card) {
      const isDebit = card.type === CardType.DEBIT;
      const prefix = isDebit ? "4000" : "5100";
      const newCardNo = `${prefix} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`;
      const newExpiry = "12/31";
      const newCvv = String(Math.floor(100 + Math.random()*900));
      
      const updatedCard = {
        ...card,
        cardNumber: newCardNo,
        expiryDate: newExpiry,
        cvv: newCvv,
        status: CardStatus.ACTIVE,
        spentToday: 0
      };

      const log = {
        id: `AUD-${Math.random()}`,
        adminUsername: "admin",
        action: "Replace Card",
        details: `Replaced card ID ${cardId} with brand new card number ending in ${newCardNo.slice(-4)}`,
        date: new Date().toISOString()
      };

      await AuroraDB.saveCard(updatedCard);
      await AuroraDB.saveAuditLog(log);
      syncState();
      alert(`Card replaced successfully!\n\nNew Card Number: ${newCardNo}\nExpiry: ${newExpiry}\nCVV: ${newCvv}\n\nThis card is now Active & ready to use.`);
    }
  };

  const handleGenerateNewCard = async (type: "Debit Card" | "Credit Card") => {
    const state = AuroraDB.getState();
    const userAccs = state.accounts.filter((a: any) => a.userId === selectedUserId);
    if (userAccs.length === 0) {
      alert("Error: This user has no bank accounts. Please open an account first.");
      return;
    }
    
    const isDebit = type === "Debit Card";
    const prefix = isDebit ? "4000" : "5100";
    const cardNo = `${prefix} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`;
    const cardId = `CARD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const userCards = state.cards.filter((c: any) => c.userId === selectedUserId);

    const newCard: any = {
      id: cardId,
      userId: selectedUserId,
      accountId: userAccs[0].id,
      cardNumber: cardNo,
      expiryDate: "12/31",
      cvv: String(Math.floor(100 + Math.random()*900)),
      type: isDebit ? CardType.DEBIT : CardType.CREDIT,
      status: CardStatus.ACTIVE,
      dailyLimit: isDebit ? 5000 : 10000,
      spentToday: 0,
      pin: "1234",
      isDefault: userCards.length === 0
    };

    const log = {
      id: `AUD-${Math.random()}`,
      adminUsername: "admin",
      action: "Generate Card",
      details: `Generated new ${type} (ID: ${cardId}, Ending in ${cardNo.slice(-4)}) for user ${selectedUserId}`,
      date: new Date().toISOString()
    };

    await AuroraDB.saveCard(newCard);
    await AuroraDB.saveAuditLog(log);
    syncState();
    alert(`Successfully generated a brand new ${type} for this customer!`);
  };

  const handleDownloadReport = (type: string) => {
    alert(`[REPORT DOWNLOADED] Excel/PDF generated successfully. ${type} metadata exported from databases.`);
  };

  const handleDatabaseBackup = () => {
    alert("[BACKUP SAVED] Database snapshot serialized and written securely to local server disk storage.");
  };

  const autofillAdmin = () => {
    setAdminUsername("admin");
    setAdminPassword("AdminPassword");
  };

  const totalDeposits = dbState?.accounts ? dbState.accounts.reduce((sum: number, a: any) => sum + a.balance, 0) : 0;
  const pendingLoans = dbState?.loans ? dbState.loans.filter((l: any) => l.status === "Pending Approval") : [];

  if (isAdminLoggedIn && !dbState) {
    return (
      <div className="min-h-screen bg-[#051126] text-white flex items-center justify-center font-sans">
        <div className="text-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D8A63D] mx-auto"></div>
          <p className="text-sm text-gray-400 font-mono text-xs">Synchronizing secure database state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051126] text-white px-6 py-6 flex flex-col justify-between max-w-lg mx-auto font-sans text-left">
      
      {/* 1. ADMIN LOGIN PANEL */}
      {!isAdminLoggedIn ? (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase">ADMIN ACCESS</span>
            <div className="w-10 h-10" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#D8A63D]/10 border border-[#D8A63D] rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-[#D8A63D]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Aurora Admin</h2>
              <p className="text-gray-400 text-xs mt-1.5">Authorized administrative session port only.</p>
            </div>

            <div className="mb-6 flex justify-center">
              <button
                onClick={autofillAdmin}
                className="px-3.5 py-1.5 bg-[#D8A63D]/20 border border-[#D8A63D]/40 text-[#D8A63D] rounded-full text-xs font-mono font-bold uppercase hover:bg-[#D8A63D]/30 transition-colors"
              >
                ⚡ Autofill Admin Login
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">ADMIN USERNAME</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    placeholder="Enter admin ID"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#D8A63D] focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">ADMIN PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#D8A63D] focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#D8A63D] to-amber-600 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Authorize & Unlock</span>
              </motion.button>
            </form>
          </div>
        </div>
      ) : (
        
        // 2. ADMIN PORTAL DASHBOARD
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <span className="text-xs font-mono text-[#D8A63D]">AURORA CONTROL PANEL</span>
              <h2 className="text-xl font-black">Victoria Stirling (COO)</h2>
            </div>
            
            <button
              onClick={() => {
                setIsAdminLoggedIn(false);
                sessionStorage.removeItem("aurora_admin_logged_in");
                navigate("/admin");
              }}
              className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono hover:bg-white/10"
            >
              Lock Panel
            </button>
          </div>

          {/* Admin Navigation tabs */}
          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl shrink-0 overflow-x-auto mb-6">
            {[
              { id: "dashboard", label: "Overview" },
              { id: "users", label: "Users" },
              { id: "loans", label: "Loans" },
              { id: "audit", label: "Audits" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id as any)}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold shrink-0 ${subView === tab.id ? "bg-[#D8A63D] text-[#071C3F]" : "text-gray-400"}`}
              >
                {tab.label} {tab.id === "loans" && pendingLoans.length > 0 && `(${pendingLoans.length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pb-6">
            
            {/* OVERVIEW SUBVIEW */}
            {subView === "dashboard" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/5 border border-white/15 rounded-xl p-4">
                    <span className="text-[9px] font-mono text-gray-400 block">TOTAL REGISTERED CUSTOMERS</span>
                    <span className="text-xl font-bold mt-1.5 block">{dbState.users.length} Users</span>
                  </div>

                  <div className="bg-white/5 border border-white/15 rounded-xl p-4">
                    <span className="text-[9px] font-mono text-gray-400 block">TOTAL CAPITAL RESERVE DEPOSITS</span>
                    <span className="text-xl font-bold mt-1.5 block text-[#D8A63D]">${totalDeposits.toLocaleString()}</span>
                  </div>

                  <div className="bg-white/5 border border-white/15 rounded-xl p-4">
                    <span className="text-[9px] font-mono text-gray-400 block">PENDING LOAN ESCROWS</span>
                    <span className="text-xl font-bold mt-1.5 block">{pendingLoans.length} Loans</span>
                  </div>

                  <div className="bg-white/5 border border-white/15 rounded-xl p-4">
                    <span className="text-[9px] font-mono text-gray-400 block">TOTAL SYSTEM LEDGER LOGS</span>
                    <span className="text-xl font-bold mt-1.5 block">{dbState.auditLogs.length + dbState.securityLogs.length} Entries</span>
                  </div>
                </div>

                {/* Exporter triggers */}
                <div className="bg-white/5 border border-[#D8A63D]/20 rounded-2xl p-5 space-y-3.5">
                  <span className="text-xs font-mono font-bold text-white block uppercase">Operational Controls</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadReport("Customers statement")}
                      className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs rounded-lg text-gray-200 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel</span>
                    </button>
                    <button
                      onClick={handleDatabaseBackup}
                      className="py-2 bg-[#D8A63D]/10 hover:bg-[#D8A63D]/20 border border-[#D8A63D]/30 text-xs rounded-lg text-[#D8A63D] flex items-center justify-center gap-1.5"
                    >
                      <Database className="w-4 h-4" />
                      <span>Backup DB</span>
                    </button>
                  </div>
                </div>

                {/* Hidden Admin Access Settings */}
                <div className="bg-white/5 border border-[#D8A63D]/20 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-white block uppercase">Hidden Admin Access</span>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                        Enable or disable the hidden portal entry link on the Landing page. When locked, clicking the hidden link does nothing.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs whitespace-nowrap bg-white/5 px-3 py-2 rounded-xl border border-white/10 self-start sm:self-center shrink-0">
                      <span className="text-gray-400">Status:</span>
                      {isHiddenLinkLocked ? (
                        <span className="text-red-400 flex items-center gap-1 font-bold">
                          <span>🔒</span> Locked (Disabled)
                        </span>
                      ) : (
                        <span className="text-green-400 flex items-center gap-1 font-bold">
                          <span>🔓</span> Unlocked (Enabled)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-1 border-t border-white/5">
                    <button
                      onClick={async () => {
                        const nextLocked = !isHiddenLinkLocked;
                        setIsHiddenLinkLocked(nextLocked);
                        localStorage.setItem("aurora_hidden_link_locked", String(nextLocked));

                        // Log this system setting change in audit state
                        const auditLogItem = {
                          id: `AUD-${Math.random()}`,
                          adminUsername: "admin",
                          action: "Toggle Hidden Portal Access",
                          details: `Changed hidden admin link access state to: ${nextLocked ? "Locked" : "Unlocked"}`,
                          date: new Date().toISOString()
                        };
                        const state = AuroraDB.getState();
                        state.auditLogs.unshift(auditLogItem);
                        await AuroraDB.saveAuditLog(auditLogItem);
                        syncState();
                      }}
                      className={`py-2 px-5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                        isHiddenLinkLocked
                          ? "bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 text-green-400"
                          : "bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400"
                      }`}
                    >
                      <span>[ Toggle Lock ]</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS SUBVIEW */}
            {subView === "users" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {selectedUserId ? (
                  /* USER DETAIL VIEW */
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-bold hover:bg-white/10 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Users</span>
                      </button>
                      <span className="text-xs font-mono font-bold text-[#D8A63D]">USER: {selectedUserId}</span>
                    </div>

                    {/* User Profile Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {editFirstName} {editLastName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">@{editUsername} • {editEmail}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                        editStatus === "Active"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : editStatus === "Suspended"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {editStatus}
                      </span>
                    </div>

                    {/* Management Sub-Tabs */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto">
                      {[
                        { id: "profile", label: "Profile" },
                        { id: "accounts", label: "Accounts" },
                        { id: "cards", label: "Cards" },
                        { id: "transactions", label: "Transactions" },
                        { id: "notifications", label: "Notifs" }
                      ].map((tab: any) => (
                        <button
                          type="button"
                          key={tab.id}
                          onClick={() => setUserTab(tab.id)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase transition-all whitespace-nowrap px-2 ${
                            userTab === tab.id
                              ? "bg-[#D8A63D] text-[#051126]"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* SUB-TAB: PROFILE EDIT */}
                    {userTab === "profile" && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                        <span className="text-xs font-mono tracking-widest text-[#D8A63D] uppercase font-bold block border-b border-white/5 pb-2">Edit Customer Details</span>

                        {/* Profile Photo Upload/Manage Section */}
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <div className="shrink-0">
                            {editProfilePic ? (
                              <img
                                src={editProfilePic}
                                className="w-16 h-16 rounded-full object-cover border-2 border-[#D8A63D]"
                                alt="Admin upload preview"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-blue-600 border-2 border-[#D8A63D] flex items-center justify-center font-extrabold text-white text-lg">
                                {editFirstName.charAt(0) || "U"}{editLastName.charAt(0) || "P"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2 text-left">
                            <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Profile Photo Management</span>
                            <div className="flex flex-wrap gap-2">
                              {/* File Input for Upload */}
                              <label className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-[10px] font-mono text-white cursor-pointer transition-colors block">
                                📁 Upload File
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = (event: any) => {
                                        setEditProfilePic(event.target.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              {editProfilePic && (
                                <button
                                  type="button"
                                  onClick={() => setEditProfilePic("")}
                                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-mono transition-colors"
                                >
                                  Remove Photo
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={editProfilePic}
                              onChange={(e) => setEditProfilePic(e.target.value)}
                              placeholder="Or paste profile photo URL here..."
                              className="w-full px-2.5 py-1.5 bg-[#051126] border border-white/10 rounded-lg text-[10px] font-mono text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">First Name</label>
                            <input
                              type="text"
                              value={editFirstName}
                              onChange={e => setEditFirstName(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Last Name</label>
                            <input
                              type="text"
                              value={editLastName}
                              onChange={e => setEditLastName(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Username</label>
                            <input
                              type="text"
                              value={editUsername}
                              onChange={e => setEditUsername(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Email Address</label>
                            <input
                              type="type"
                              value={editEmail}
                              onChange={e => setEditEmail(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Phone Number</label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={e => setEditPhone(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Customer Status</label>
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value as any)}
                              className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            >
                              <option value="Active">Active</option>
                              <option value="Suspended">Suspended</option>
                              <option value="Locked">Locked</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Date of Birth</label>
                            <input
                              type="date"
                              value={editDob}
                              onChange={e => setEditDob(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                          </div>
                          <div>
                            {/* Balance space */}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Employment / Role</label>
                          <input
                            type="text"
                            value={editEmployment}
                            onChange={e => setEditEmployment(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Residential Address</label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={e => setEditAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Next of Kin (Full Name & Relationship)</label>
                          <input
                            type="text"
                            value={editNextOfKin}
                            onChange={e => setEditNextOfKin(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Dashboard Display Currency (Lock/Choose for User)</label>
                          <select
                            value={editPreferredCurrency}
                            onChange={e => setEditPreferredCurrency(e.target.value)}
                            className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-left space-y-1">
                          <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span>🔑 Unified Login Credential</span>
                          </p>
                          <p className="text-[9px] text-gray-300 leading-relaxed">
                            Whichever credential you set or generate (either the password or the login PIN) becomes the <strong>sole</strong> active credential used to access the user account. They are kept in perfect sync.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">App Login PIN (6-digit)</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={editAppPin}
                              onChange={e => setEditAppPin(e.target.value.replace(/\D/g, ""))}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D] font-mono text-center font-bold tracking-widest text-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">Transaction PIN (4-digit)</label>
                            <input
                              type="text"
                              maxLength={4}
                              value={editTransactionPin}
                              onChange={e => setEditTransactionPin(e.target.value.replace(/\D/g, ""))}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D] font-mono text-center font-bold tracking-widest text-blue-400"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                          <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Set / Reset Password</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editPassword}
                              onChange={e => setEditPassword(e.target.value)}
                              placeholder="Leave blank to keep current, or enter new password"
                              className="flex-1 px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D8A63D]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                                let pass = "";
                                for (let i = 0; i < 12; i++) {
                                  pass += chars.charAt(Math.floor(Math.random() * chars.length));
                                }
                                setEditPassword(pass);
                              }}
                              className="px-3 py-2 bg-[#D8A63D]/10 hover:bg-[#D8A63D]/20 border border-[#D8A63D]/30 text-[#D8A63D] font-mono text-[10px] uppercase font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              ⚡ Generate
                            </button>
                          </div>
                          <p className="text-[9px] font-mono text-gray-400">
                            {editPassword ? "💡 Newly generated or typed password. Saving this will sync it with the App PIN to maintain one unified login credential." : "Password remains unchanged unless updated here."}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          className="w-full py-2.5 bg-[#D8A63D] hover:bg-amber-500 text-[#051126] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}

                    {/* SUB-TAB: ACCOUNTS MANAGEMENT */}
                    {userTab === "accounts" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-gray-400">FINANCIAL HOLDINGS</span>
                          <button
                            type="button"
                            onClick={() => setShowAddAcc(!showAddAcc)}
                            className="px-3 py-1.5 bg-[#D8A63D] hover:bg-amber-500 text-[#051126] font-bold font-mono text-[10px] rounded transition-all cursor-pointer"
                          >
                            {showAddAcc ? "Cancel" : "+ Add Account"}
                          </button>
                        </div>

                        {/* Add Account Panel Form */}
                        {showAddAcc && (
                          <div className="bg-white/5 border border-[#D8A63D]/30 rounded-2xl p-4 space-y-4">
                            <span className="text-[10px] font-mono font-bold text-[#D8A63D] uppercase block">Open New Asset/Liability Account</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Account Type</label>
                                <select
                                  value={newAccType}
                                  onChange={e => setNewAccType(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="Checking Account">Checking Account</option>
                                  <option value="Savings Account">Savings Account</option>
                                  <option value="Business Account">Business Account</option>
                                  <option value="Fixed Deposit">Fixed Deposit</option>
                                  <option value="Joint Account">Joint Account</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Currency</label>
                                <select
                                  value={newAccCurrency}
                                  onChange={e => setNewAccCurrency(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="CAD">CAD ($)</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-gray-400 mb-1">Initial Balance</label>
                              <input
                                type="number"
                                value={newAccBalance}
                                onChange={e => setNewAccBalance(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddAccount}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Deploy Account Line
                            </button>
                          </div>
                        )}

                        {/* Edit Balance Panel Form */}
                        {editingAccId && (
                          <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Adjust Balance (Acc: {editingAccId})</span>
                              <button type="button" onClick={() => setEditingAccId(null)} className="text-gray-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                              {[
                                { id: "set", label: "Set" },
                                { id: "add", label: "Add" },
                                { id: "sub", label: "Sub" }
                              ].map(op => (
                                <button
                                  type="button"
                                  key={op.id}
                                  onClick={() => setBalanceEditType(op.id as any)}
                                  className={`flex-1 py-1 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${balanceEditType === op.id ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"}`}
                                >
                                  {op.label}
                                </button>
                              ))}
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-gray-400 mb-1">Value Amount</label>
                              <input
                                type="number"
                                value={balanceEditValue}
                                onChange={e => setBalanceEditValue(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleEditBalance}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Commit Balance Adjust
                            </button>
                          </div>
                        )}

                        {/* Edit Account Details Panel Form */}
                        {editingFullAccId && (
                          <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Edit Account Details ({editingFullAccId})</span>
                              <button type="button" onClick={() => setEditingFullAccId(null)} className="text-gray-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Account Number</label>
                                <input
                                  type="text"
                                  value={editAccNumber}
                                  onChange={e => setEditAccNumber(e.target.value)}
                                  className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Account Type</label>
                                <select
                                  value={editAccType}
                                  onChange={e => setEditAccType(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="Checking Account">Checking Account</option>
                                  <option value="Savings Account">Savings Account</option>
                                  <option value="Business Account">Business Account</option>
                                  <option value="Fixed Deposit">Fixed Deposit</option>
                                  <option value="Joint Account">Joint Account</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Currency</label>
                                <select
                                  value={editAccCurrency}
                                  onChange={e => setEditAccCurrency(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="CAD">CAD ($)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Account Status</label>
                                <select
                                  value={editAccStatus}
                                  onChange={e => setEditAccStatus(e.target.value as any)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Frozen">Frozen</option>
                                  <option value="Suspended">Suspended</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleSaveAccountDetails}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Save Account Details
                            </button>
                          </div>
                        )}

                        {/* Bank Accounts List */}
                        <div className="space-y-3">
                          {dbState.accounts
                            .filter((acc: any) => acc.userId === selectedUserId)
                            .map((acc: any) => (
                              <div
                                key={acc.id}
                                className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold text-white tracking-tight">{acc.type}</div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-1">{acc.accountNumber} • {acc.id}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-[#D8A63D] font-mono">
                                      {acc.currency === "USD" ? "$" : acc.currency === "EUR" ? "€" : acc.currency === "GBP" ? "£" : ""}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded-full uppercase mt-1 inline-block ${acc.status === "Active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : acc.status === "Frozen" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                                      {acc.status}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAccId(acc.id);
                                      setBalanceEditValue(acc.balance);
                                      setBalanceEditType("set");
                                      setEditingFullAccId(null);
                                    }}
                                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold uppercase rounded text-gray-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[#D8A63D]" />
                                    <span>Edit Balance</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleStartEditAccountDetails(acc);
                                      setEditingAccId(null);
                                    }}
                                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold uppercase rounded text-gray-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Edit Info</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFreezeAccount(acc)}
                                    className={`px-2.5 py-1.5 border rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center ${acc.status === "Frozen" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"}`}
                                  >
                                    {acc.status === "Frozen" ? "Unfreeze" : "Freeze"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccount(acc.id)}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded transition-all cursor-pointer flex items-center justify-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}

                          {dbState.accounts.filter((acc: any) => acc.userId === selectedUserId).length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                              No financial accounts associated with this user profile.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB: CARD MANAGEMENT */}
                    {userTab === "cards" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-gray-400">CREDIT & DEBIT CARD PORTFOLIO</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleGenerateNewCard("Debit Card")}
                              className="px-2.5 py-1.5 bg-[#D8A63D]/20 border border-[#D8A63D]/40 text-[#D8A63D] hover:bg-[#D8A63D]/30 font-bold font-mono text-[9px] rounded transition-all cursor-pointer"
                            >
                              + New Debit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGenerateNewCard("Credit Card")}
                              className="px-2.5 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold font-mono text-[9px] rounded transition-all cursor-pointer"
                            >
                              + New Credit
                            </button>
                          </div>
                        </div>

                        {/* List of user's cards */}
                        <div className="space-y-4">
                          {dbState.cards
                            .filter((c: any) => c.userId === selectedUserId)
                            .map((c: any) => {
                              const isEditing = editingCardId === c.id;
                              const isDebit = c.type === "Debit Card" || c.type === "DEBIT";
                              
                              return (
                                <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                                  {/* Background highlight for default card */}
                                  {c.isDefault && (
                                    <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 border-l border-b border-emerald-500/20 px-3 py-1 rounded-bl-xl text-[9px] font-mono font-bold tracking-wider uppercase">
                                      ★ DEFAULT CARD
                                    </div>
                                  )}

                                  {/* Real-time mini visual card banner */}
                                  <div className={`p-4 rounded-xl text-left relative ${isDebit ? 'bg-gradient-to-br from-blue-900 to-[#071C3F] border border-blue-500/20' : 'bg-gradient-to-br from-amber-950 to-[#3a2205] border border-amber-500/20'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <span className="text-[10px] font-mono opacity-80 uppercase block">{c.type}</span>
                                        <span className="text-xs font-mono font-bold">{c.cardNumber}</span>
                                      </div>
                                      <span className="text-lg font-extrabold italic font-mono tracking-wider opacity-60">
                                        {isDebit ? "VISA" : "MC"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                      <div>
                                        <span className="text-[8px] font-mono opacity-50 block">EXPIRY</span>
                                        <span className="text-[10px] font-mono font-bold">{c.expiryDate}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] font-mono opacity-50 block">CVV</span>
                                        <span className="text-[10px] font-mono font-bold">{c.cvv}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] font-mono opacity-50 block">ATM PIN</span>
                                        <span className="text-[10px] font-mono font-bold">{c.pin}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] font-mono opacity-50 block">STATUS</span>
                                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : c.status === "Frozen" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                                          {c.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card controls and statistics */}
                                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-left bg-[#051126] p-2 rounded-xl">
                                    <div>
                                      <span className="text-[9px] text-gray-500 block">DAILY SPENDING LIMIT</span>
                                      <span className="font-bold text-white">${c.dailyLimit.toLocaleString()}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-gray-500 block">SPENT TODAY</span>
                                      <span className="font-bold text-gray-400">${c.spentToday.toLocaleString()}</span>
                                    </div>
                                  </div>

                                  {/* Quick Action buttons */}
                                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCardId(c.id);
                                        setEditCardNo(c.cardNumber);
                                        setEditCardExpiry(c.expiryDate);
                                        setEditCardCvv(c.cvv);
                                        setEditCardType(c.type);
                                        setEditCardStatus(c.status);
                                        setEditCardPin(c.pin);
                                        setEditCardLimit(c.dailyLimit);
                                        setEditCardSpent(c.spentToday);
                                        setEditCardAccount(c.accountId);
                                      }}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono cursor-pointer transition-colors"
                                    >
                                      ✏️ Edit Details
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFreezeCard(c.id)}
                                      className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${c.status === "Frozen" ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"}`}
                                    >
                                      {c.status === "Frozen" ? "❄️ Unfreeze" : "❄️ Freeze"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleActiveCard(c.id)}
                                      className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${c.status === "Active" ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400" : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"}`}
                                    >
                                      {c.status === "Active" ? "🚫 Deactivate" : "✅ Activate"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReplaceCard(c.id)}
                                      className="px-2 py-1 bg-[#D8A63D]/10 hover:bg-[#D8A63D]/20 text-[#D8A63D] rounded text-[10px] font-mono cursor-pointer transition-colors"
                                    >
                                      🔄 Replace Card
                                    </button>
                                    {!c.isDefault && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetDefaultCard(c.id)}
                                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono cursor-pointer transition-colors"
                                      >
                                        ★ Set Default
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCard(c.id)}
                                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-[10px] font-mono cursor-pointer transition-colors shrink-0"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>

                                  {/* Inline Edit Form for the Card */}
                                  {isEditing && (
                                    <div className="bg-[#051126] border border-[#D8A63D]/30 rounded-xl p-4 mt-3 space-y-3 text-left">
                                      <span className="text-[10px] font-mono font-bold text-[#D8A63D] uppercase block">Edit Parameters for Card {c.id}</span>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">Card Number (Demo)</label>
                                          <input
                                            type="text"
                                            value={editCardNo}
                                            onChange={e => setEditCardNo(e.target.value)}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">Expiry Date</label>
                                          <input
                                            type="text"
                                            value={editCardExpiry}
                                            onChange={e => setEditCardExpiry(e.target.value)}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">CVV (Demo)</label>
                                          <input
                                            type="text"
                                            value={editCardCvv}
                                            onChange={e => setEditCardCvv(e.target.value)}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">ATM PIN</label>
                                          <input
                                            type="text"
                                            value={editCardPin}
                                            onChange={e => setEditCardPin(e.target.value)}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">Daily Limit ($)</label>
                                          <input
                                            type="number"
                                            value={editCardLimit}
                                            onChange={e => setEditCardLimit(Number(e.target.value))}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">Spent Today ($)</label>
                                          <input
                                            type="number"
                                            value={editCardSpent}
                                            onChange={e => setEditCardSpent(Number(e.target.value))}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">Card Type</label>
                                          <select
                                            value={editCardType}
                                            onChange={e => setEditCardType(e.target.value)}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          >
                                            <option value="Debit Card">Debit Card</option>
                                            <option value="Credit Card">Credit Card</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-mono text-gray-400 mb-1">Card Status</label>
                                          <select
                                            value={editCardStatus}
                                            onChange={e => setEditCardStatus(e.target.value)}
                                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                          >
                                            <option value="Active">Active</option>
                                            <option value="Frozen">Frozen</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Replaced">Replaced</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[8px] font-mono text-gray-400 mb-1">Link to Account ID</label>
                                        <select
                                          value={editCardAccount}
                                          onChange={e => setEditCardAccount(e.target.value)}
                                          className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none"
                                        >
                                          {dbState.accounts
                                            .filter((acc: any) => acc.userId === selectedUserId)
                                            .map((acc: any) => (
                                              <option key={acc.id} value={acc.id}>
                                                {acc.type} ({acc.accountNumber})
                                              </option>
                                            ))}
                                        </select>
                                      </div>

                                      <div className="flex gap-2 pt-1 justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setEditingCardId(null)}
                                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveCardDetails(c.id)}
                                          className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded text-[10px] font-mono font-bold"
                                        >
                                          Save Parameters
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          {dbState.cards.filter((c: any) => c.userId === selectedUserId).length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                              No debit/credit cards linked to this user profile.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB: TRANSACTIONS RECORD */}
                    {userTab === "transactions" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-gray-400">LEDGER ENTRIES</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddTxn(!showAddTxn);
                              const userAccs = dbState.accounts.filter((acc: any) => acc.userId === selectedUserId);
                              if (userAccs.length > 0) {
                                setNewTxnAccId(userAccs[0].id);
                              }
                            }}
                            className="px-3 py-1.5 bg-[#D8A63D] hover:bg-amber-500 text-[#051126] font-bold font-mono text-[10px] rounded transition-all cursor-pointer"
                          >
                            {showAddTxn ? "Cancel" : "+ Add Transaction"}
                          </button>
                        </div>

                        {/* Add Transaction Form Panel */}
                        {showAddTxn && (
                          <div className="bg-white/5 border border-[#D8A63D]/30 rounded-2xl p-4 space-y-4">
                            <span className="text-[10px] font-mono font-bold text-[#D8A63D] uppercase block">Inject Ledger Entry</span>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Target Account</label>
                                <select
                                  value={newTxnAccId}
                                  onChange={e => setNewTxnAccId(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  {dbState.accounts
                                    .filter((acc: any) => acc.userId === selectedUserId)
                                    .map((acc: any) => (
                                      <option key={acc.id} value={acc.id}>{acc.type} ({acc.id})</option>
                                    ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Category</label>
                                <select
                                  value={newTxnCategory}
                                  onChange={e => setNewTxnCategory(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="Salary">Salary</option>
                                  <option value="Food & Dining">Food & Dining</option>
                                  <option value="Shopping">Shopping</option>
                                  <option value="Travel & Transit">Travel & Transit</option>
                                  <option value="Utilities & Bills">Utilities & Bills</option>
                                  <option value="Investment">Investment</option>
                                  <option value="Transfer">Transfer</option>
                                  <option value="Loan">Loan</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Merchant</label>
                                <input
                                  type="text"
                                  value={newTxnMerchant}
                                  onChange={e => setNewTxnMerchant(e.target.value)}
                                  placeholder="Starbucks, Stripe etc."
                                  className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Amount (+ Credit, - Debit)</label>
                                <input
                                  type="number"
                                  value={newTxnAmount}
                                  onChange={e => setNewTxnAmount(Number(e.target.value))}
                                  placeholder="-10 or 500"
                                  className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Status</label>
                                <select
                                  value={newTxnStatus}
                                  onChange={e => setNewTxnStatus(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="Completed">Completed</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Failed">Failed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Transaction Date</label>
                                <input
                                  type="datetime-local"
                                  value={newTxnDate}
                                  onChange={e => setNewTxnDate(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-gray-400 mb-1">Description</label>
                              <input
                                type="text"
                                value={newTxnDesc}
                                onChange={e => setNewTxnDesc(e.target.value)}
                                placeholder="Details of transaction"
                                className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleAddTransaction}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Log Transaction Entry
                            </button>
                          </div>
                        )}

                        {/* Recent Ledger History */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {/* Edit Transaction Form Panel */}
                          {editingTxnId && (
                            <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-4 mb-4 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase block">Edit Ledger Entry ({editingTxnId})</span>
                                <button type="button" onClick={() => setEditingTxnId(null)} className="text-gray-400 hover:text-white cursor-pointer">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 mb-1">Category</label>
                                  <select
                                    value={editTxnCategory}
                                    onChange={e => setEditTxnCategory(e.target.value)}
                                    className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
                                  >
                                    <option value="Salary">Salary</option>
                                    <option value="Food & Dining">Food & Dining</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Travel & Transit">Travel & Transit</option>
                                    <option value="Utilities & Bills">Utilities & Bills</option>
                                    <option value="Investment">Investment</option>
                                    <option value="Transfer">Transfer</option>
                                    <option value="Loan">Loan</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 mb-1">Amount (+ Credit, - Debit)</label>
                                  <input
                                    type="number"
                                    value={editTxnAmount}
                                    onChange={e => setEditTxnAmount(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 mb-1">Merchant</label>
                                  <input
                                    type="text"
                                    value={editTxnMerchant}
                                    onChange={e => setEditTxnMerchant(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 mb-1">Status</label>
                                  <select
                                    value={editTxnStatus}
                                    onChange={e => setEditTxnStatus(e.target.value)}
                                    className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
                                  >
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 mb-1">Transaction Date</label>
                                  <input
                                    type="datetime-local"
                                    value={editTxnDate}
                                    onChange={e => setEditTxnDate(e.target.value)}
                                    className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-400 mb-1">Description</label>
                                  <input
                                    type="text"
                                    value={editTxnDesc}
                                    onChange={e => setEditTxnDesc(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleSaveTransaction}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                              >
                                Save Transaction Changes
                              </button>
                            </div>
                          )}

                          {dbState.transactions
                            .filter((txn: any) => txn.userId === selectedUserId)
                            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((txn: any) => {
                              const isPositive = txn.amount > 0;
                              return (
                                <div
                                  key={txn.id}
                                  className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-white tracking-tight">{txn.merchant}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{txn.description}</div>
                                    <span className="text-[8px] font-mono bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.2 rounded mt-1 inline-block uppercase">
                                      {txn.category}
                                    </span>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                                    <div className={`font-mono font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                      {isPositive ? "+" : ""}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-mono mt-0.5">{new Date(txn.date).toLocaleDateString()}</div>
                                    <div className="flex gap-1.5 mt-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditTransaction(txn)}
                                        className="p-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-amber-400 cursor-pointer"
                                        title="Edit Transaction"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTransaction(txn.id)}
                                        className="p-1 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded text-red-400 cursor-pointer"
                                        title="Delete Transaction"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                          {dbState.transactions.filter((txn: any) => txn.userId === selectedUserId).length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-500">
                              No ledger transaction records for this customer.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB: NOTIFICATIONS CENTER */}
                    {userTab === "notifications" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-gray-400">DISPATCHED PUSH LOGS</span>
                          <button
                            type="button"
                            onClick={() => setShowAddNotif(!showAddNotif)}
                            className="px-3 py-1.5 bg-[#D8A63D] hover:bg-amber-500 text-[#051126] font-bold font-mono text-[10px] rounded transition-all cursor-pointer"
                          >
                            {showAddNotif ? "Cancel" : "+ Add Notification"}
                          </button>
                        </div>

                        {/* Add Notification Alert Form */}
                        {showAddNotif && (
                          <div className="bg-white/5 border border-[#D8A63D]/30 rounded-2xl p-4 space-y-4">
                            <span className="text-[10px] font-mono font-bold text-[#D8A63D] uppercase block">Send Push Alert Notification</span>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Target Audience</label>
                                <select
                                  value={notifSendTo}
                                  onChange={e => setNotifSendTo(e.target.value as any)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
                                >
                                  <option value="single">Single Selected User only</option>
                                  <option value="all">Broadcast (ALL registered users)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-gray-400 mb-1">Category</label>
                                <select
                                  value={newNotifCategory}
                                  onChange={e => setNewNotifCategory(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                                >
                                  <option value="Transaction">Transaction</option>
                                  <option value="Salary">Salary</option>
                                  <option value="Login">Login</option>
                                  <option value="Low Balance">Low Balance</option>
                                  <option value="Security">Security</option>
                                  <option value="Promotion">Promotion</option>
                                  <option value="General">General</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-gray-400 mb-1">Title</label>
                              <input
                                type="text"
                                value={newNotifTitle}
                                onChange={e => setNewNotifTitle(e.target.value)}
                                placeholder="Salary Deposited, Alert etc."
                                className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-gray-400 mb-1">Message Text</label>
                              <textarea
                                value={newNotifMsg}
                                onChange={e => setNewNotifMsg(e.target.value)}
                                placeholder="Write the full alert description for user's feed..."
                                rows={3}
                                className="w-full px-3 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleAddNotification}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                            >
                              Dispatch Alert Log
                            </button>
                          </div>
                        )}

                        {/* Dispatched Alerts History */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {dbState.notifications
                            .filter((n: any) => n.userId === selectedUserId)
                            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((n: any) => (
                              <div
                                key={n.id}
                                className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="font-bold text-white leading-tight">{n.title}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[8px] font-mono text-gray-500">{new Date(n.date).toLocaleDateString()}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteNotification(n.id)}
                                      className="p-1 text-red-400 hover:bg-red-500/20 rounded border border-white/10 cursor-pointer"
                                      title="Delete Notification"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-gray-400 leading-normal text-[10px]">{n.message}</div>
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-[7px] font-mono tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1 rounded uppercase">
                                    {n.category}
                                  </span>
                                  <span className={`text-[7px] font-mono ${n.isRead ? "text-gray-500" : "text-amber-400 font-bold"}`}>
                                    {n.isRead ? "Read" : "Unread"}
                                  </span>
                                </div>
                              </div>
                            ))}

                          {dbState.notifications.filter((n: any) => n.userId === selectedUserId).length === 0 && (
                            <div className="text-center py-8 text-xs text-gray-500">
                              No push notification logs registered for this customer.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* USERS LIST VIEW WITH FILTERED SEARCH */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">CUSTOMER ACCOUNTS ENGINE</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDemoGenForm(!showDemoGenForm)}
                          className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded text-xs font-mono text-white font-bold cursor-pointer flex items-center gap-1"
                        >
                          👥 {showDemoGenForm ? "Close Panel" : "Generate Demo Customer"}
                        </button>
                        <button
                          onClick={handleGenerateMilitaryCustomer}
                          className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded text-xs font-mono text-white font-bold cursor-pointer flex items-center gap-1"
                        >
                          🎖️ Generate Military Demo Customer
                        </button>
                        <button
                          onClick={handleCreateCustomer}
                          className="px-3 py-1 bg-[#D8A63D] hover:bg-amber-500 rounded text-xs font-mono text-[#071C3F] font-bold cursor-pointer"
                        >
                          + Quick Mock User
                        </button>
                      </div>
                    </div>

                    {/* Interactive Demo Customer Generation Panel */}
                    {showDemoGenForm && (
                      <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-4 space-y-4 text-left">
                        <div className="border-b border-white/5 pb-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">💻 DEMO CUSTOMER PROFILE BUILDER</span>
                          <p className="text-[10px] text-gray-400 mt-1">Configure parameters to generate a complete customer profile with 92 months of mathematically consistent financial records (Checking, Savings, Debit & Credit Cards, and History spanning Jan 2017 to Aug 2024).</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-gray-400 mb-1">First Name (Optional)</label>
                            <input
                              type="text"
                              value={demoFirstName}
                              onChange={e => setDemoFirstName(e.target.value)}
                              placeholder="Random if empty"
                              className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-gray-400 mb-1">Last Name (Optional)</label>
                            <input
                              type="text"
                              value={demoLastName}
                              onChange={e => setDemoLastName(e.target.value)}
                              placeholder="Random if empty"
                              className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-gray-400 mb-1">Employer / Organization</label>
                            <input
                              type="text"
                              value={demoEmployer}
                              onChange={e => setDemoEmployer(e.target.value)}
                              placeholder="e.g. US Air Force or Google"
                              className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-gray-400 mb-1">Monthly Net Salary ($)</label>
                            <input
                              type="number"
                              value={demoSalary}
                              onChange={e => setDemoSalary(Number(e.target.value))}
                              placeholder="e.g. 7500"
                              className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-gray-400 mb-1">Salary Deposit Day of Month</label>
                            <input
                              type="number"
                              min="1"
                              max="28"
                              value={demoDepositDay}
                              onChange={e => setDemoDepositDay(Number(e.target.value))}
                              className="w-full px-2.5 py-2 bg-[#051126] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-gray-400 mb-1">Employment Context</label>
                            <div className="flex gap-2 h-[34px] items-center">
                              <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                                <input
                                  type="radio"
                                  name="demoEmploymentType"
                                  checked={!demoIsMilitary}
                                  onChange={() => {
                                    setDemoIsMilitary(false);
                                    if (demoEmployer === "US Armed Forces" || demoEmployer === "Department of Defense") {
                                      setDemoEmployer("NexusTech Solutions");
                                    }
                                  }}
                                  className="accent-emerald-500"
                                />
                                Civilian
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                                <input
                                  type="radio"
                                  name="demoEmploymentType"
                                  checked={demoIsMilitary}
                                  onChange={() => {
                                    setDemoIsMilitary(true);
                                    setDemoEmployer("Department of Defense");
                                  }}
                                  className="accent-emerald-500"
                                />
                                Military
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowDemoGenForm(false)}
                            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleGenerateDemoCustomer}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
                          >
                            ⚡ Build Complete Profile
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filter Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, username or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#D8A63D] focus:outline-none text-xs text-white placeholder-gray-500"
                      />
                    </div>

                    {/* Users list matching search */}
                    <div className="space-y-2.5">
                      {dbState.users
                        .filter((u: any) => {
                          const search = searchTerm.toLowerCase();
                          return (
                            (u.firstName || "").toLowerCase().includes(search) ||
                            (u.lastName || "").toLowerCase().includes(search) ||
                            (u.email || "").toLowerCase().includes(search) ||
                            (u.username || "").toLowerCase().includes(search) ||
                            (u.id || "").toLowerCase().includes(search)
                          );
                        })
                        .map((u: any, i: number) => {
                          const isSuspended = u.status === "Suspended";
                          return (
                            <div
                              key={i}
                              className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs"
                            >
                              <div>
                                <div className="font-bold text-white">{u.firstName} {u.lastName}</div>
                                <div className="text-[10px] text-gray-400 mt-1">{u.email} • {u.username}</div>
                                <div className="text-[9px] font-mono text-[#D8A63D] mt-1">{u.id}</div>
                              </div>

                              <div className="flex flex-col gap-1.5 items-end">
                                <button
                                  type="button"
                                  onClick={() => handleSelectUser(u)}
                                  className="px-3 py-1 bg-[#D8A63D]/10 hover:bg-[#D8A63D]/20 border border-[#D8A63D]/30 text-[#D8A63D] font-mono text-[10px] font-black rounded uppercase cursor-pointer"
                                >
                                  Manage
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSuspendUser(u.id)}
                                  className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider cursor-pointer ${isSuspended ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}
                                >
                                  {isSuspended ? "Activate" : "Suspend"}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {dbState.users.filter((u: any) => {
                        const search = searchTerm.toLowerCase();
                        return (
                          (u.firstName || "").toLowerCase().includes(search) ||
                          (u.lastName || "").toLowerCase().includes(search) ||
                          (u.email || "").toLowerCase().includes(search) ||
                          (u.username || "").toLowerCase().includes(search) ||
                          (u.id || "").toLowerCase().includes(search)
                        );
                      }).length === 0 && (
                        <div className="text-center py-12 text-xs text-gray-500">
                          No users matched your search criteria.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* LOANS SUBVIEW */}
            {subView === "loans" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <span className="text-xs font-mono text-gray-400 block">PENDING DEBT RECOGNITION</span>

                <div className="space-y-3">
                  {pendingLoans.map((l: any, i: number) => (
                    <div
                      key={i}
                      className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                            {l.type}
                          </span>
                          <div className="text-base font-bold mt-2 text-white">${l.amount.toLocaleString()}</div>
                          <span className="text-[10px] font-mono text-gray-400 mt-1 block">USER ID: {l.userId}</span>
                        </div>
                        <div className="text-right text-xs font-mono text-gray-300">
                          <div>TERM: {l.repaymentPeriod}mo</div>
                          <div className="mt-1">APR: {l.interestRate}%</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                        <button
                          onClick={() => handleRejectLoan(l.id)}
                          className="py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold"
                        >
                          Decline Loan
                        </button>
                        <button
                          onClick={() => handleApproveLoan(l.id)}
                          className="py-2 bg-emerald-500 hover:bg-emerald-600 text-[#071C3F] rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Credit</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingLoans.length === 0 && (
                    <div className="text-center text-xs text-gray-500 py-12">No pending credit facilities require review.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* AUDITS SUBVIEW */}
            {subView === "audit" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <span className="text-xs font-mono text-gray-400 block">SYSTEM CONSOLE AUDIT LOGS</span>
                
                <div className="space-y-2.5">
                  {dbState.auditLogs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs leading-normal font-mono"
                    >
                      <div className="flex justify-between font-bold text-white border-b border-white/5 pb-1.5 mb-1.5">
                        <span className="text-[#D8A63D]">{log.action.toUpperCase()}</span>
                        <span className="text-gray-500">{new Date(log.date).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-gray-300">{log.details}</div>
                      <span className="text-[9px] text-gray-500 block mt-1">Operator: {log.adminUsername}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
