/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AccountType {
  CHECKING = "Checking Account",
  SAVINGS = "Savings Account",
  BUSINESS = "Business Account",
  FIXED_DEPOSIT = "Fixed Deposit",
  JOINT = "Joint Account"
}

export enum AccountStatus {
  ACTIVE = "Active",
  FROZEN = "Frozen",
  SUSPENDED = "Suspended"
}

export enum CardType {
  DEBIT = "Debit Card",
  CREDIT = "Credit Card",
  VIRTUAL = "Virtual Card"
}

export enum CardStatus {
  ACTIVE = "Active",
  FROZEN = "Frozen",
  REPLACED = "Replaced"
}

export enum TransactionStatus {
  COMPLETED = "Completed",
  PENDING = "Pending",
  FAILED = "Failed"
}

export enum TransactionCategory {
  SALARY = "Salary",
  FOOD = "Food & Dining",
  SHOPPING = "Shopping",
  TRAVEL = "Travel & Transit",
  UTILITIES = "Utilities & Bills",
  INVESTMENT = "Investment",
  TRANSFER = "Transfer",
  LOAN = "Loan"
}

export enum LoanStatus {
  PENDING = "Pending Approval",
  APPROVED = "Approved",
  REJECTED = "Rejected"
}

export enum InvestmentType {
  STOCK = "Stock",
  MUTUAL_FUND = "Mutual Fund",
  FIXED_DEPOSIT = "Fixed Deposit"
}

export enum TicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  CLOSED = "Closed"
}

export interface User {
  id: string; // Customer ID
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  joinedAt: string;
  status: "Active" | "Suspended" | "Locked";
  password?: string;
  appPin: string; // 6-digit
  transactionPin: string; // 4-digit
  biometricsEnabled: {
    faceId: boolean;
    fingerprint: boolean;
  };
  securityQuestion: string;
  securityAnswer: string;
  address?: string;
  dob?: string;
  employment?: string;
  nextOfKin?: string;
  preferredCurrency?: string;
}

export interface Admin {
  username: string;
  fullName: string;
  role: string;
}

export interface BankAccount {
  id: string; // Account ID
  userId: string;
  accountNumber: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
}

export interface BankCard {
  id: string;
  userId: string;
  accountId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  type: CardType;
  status: CardStatus;
  dailyLimit: number;
  spentToday: number;
  pin: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number; // negative for expense, positive for deposit
  category: TransactionCategory;
  merchant: string;
  description: string;
  date: string;
  status: TransactionStatus;
  referenceNumber: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  bankName: string;
  accountNumber: string;
}

export interface Loan {
  id: string;
  userId: string;
  type: string; // Personal, Mortgage, Business, Auto, Education
  amount: number;
  interestRate: number;
  repaymentPeriod: number; // months
  monthlyInstallment: number;
  status: LoanStatus;
  appliedDate: string;
  approvedDate?: string;
  documents: {
    name: string;
    url: string;
  }[];
}

export interface InvestmentAsset {
  id: string;
  userId: string;
  type: InvestmentType;
  name: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  lastUpdated: string;
}

export interface BillProvider {
  id: string;
  name: string;
  category: "Electricity" | "Water" | "Internet" | "TV" | "Mobile" | "Insurance" | "School Fees" | "Taxes";
}

export interface SupportTicket {
  id: string;
  userId: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: TicketStatus;
  createdAt: string;
  messages: {
    sender: "user" | "support";
    text: string;
    timestamp: string;
  }[];
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: "Transaction" | "Salary" | "Login" | "Low Balance" | "Security" | "Promotion";
  date: string;
  isRead: boolean;
}

export interface SecurityLog {
  id: string;
  userId: string;
  event: string;
  device: string;
  location: string;
  date: string;
  status: "Success" | "Failed";
}

export interface AuditLog {
  id: string;
  adminUsername: string;
  action: string;
  details: string;
  date: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: string;
  phone: string;
  hours: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: "Active" | "On Leave" | "Suspended";
  joinedDate: string;
}
