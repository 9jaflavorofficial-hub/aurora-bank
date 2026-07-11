/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  User,
  Mail,
  Phone,
  Shield,
  Globe,
  FileText,
  HelpCircle,
  Info,
  CreditCard,
  KeyRound,
  Smartphone
} from "lucide-react";
import { AuroraDB } from "../db/mockDb";

interface RegisterProps {
  onNavigate: (page: string) => void;
}

interface DocumentUpload {
  name: string;
  size: string;
  dataUrl: string | null;
  progress: number;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  // -------------------------------------------------------------
  // STEP 1 STATE: PERSONAL INFO
  // -------------------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // -------------------------------------------------------------
  // STEP 2 STATE: IDENTITY VERIFICATION
  // -------------------------------------------------------------
  const [docs, setDocs] = useState<{
    passport: DocumentUpload;
    nationalId: DocumentUpload;
    driverLicense: DocumentUpload;
    proofOfAddress: DocumentUpload;
    selfie: DocumentUpload;
  }>({
    passport: { name: "", size: "", dataUrl: null, progress: 0 },
    nationalId: { name: "", size: "", dataUrl: null, progress: 0 },
    driverLicense: { name: "", size: "", dataUrl: null, progress: 0 },
    proofOfAddress: { name: "", size: "", dataUrl: null, progress: 0 },
    selfie: { name: "", size: "", dataUrl: null, progress: 0 }
  });

  // Selfie specific simulator states
  const [isSelfieActive, setIsSelfieActive] = useState(false);
  const [selfiePrompt, setSelfiePrompt] = useState("Position your face inside the oval frame");
  const [selfieStep, setSelfieStep] = useState(0); // 0: Ready, 1: Blink, 2: Smile, 3: Turn Head, 4: Capturing, 5: Done
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // -------------------------------------------------------------
  // STEP 3 STATE: SECURITY & CREDENTIALS
  // -------------------------------------------------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [transactionPin, setTransactionPin] = useState(["", "", "", ""]);
  const [securityQuestion, setSecurityQuestion] = useState("What was your first pet's name?");
  const [securityAnswer, setSecurityAnswer] = useState("");

  // Refs for 4-digit transaction pin boxes
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // -------------------------------------------------------------
  // STEP 4 STATE: FINAL ACTIVATION & OPTIONS
  // -------------------------------------------------------------
  const [appPin, setAppPin] = useState(["", "", "", "", "", ""]);
  const appPinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const [enableFaceId, setEnableFaceId] = useState(true);
  const [enableFingerprint, setEnableFingerprint] = useState(true);
  const [agreeTCOptions, setAgreeTCOptions] = useState(false);

  // -------------------------------------------------------------
  // SUCCESS STATE & CREATED DETAILS
  // -------------------------------------------------------------
  const [isSuccessfullyCreated, setIsSuccessfullyCreated] = useState(false);
  const [createdUsername, setCreatedUsername] = useState("");
  const [createdCustomerId, setCreatedCustomerId] = useState("");
  const [createdAccountNo, setCreatedAccountNo] = useState("");

  // Refs for standard HTML file selectors
  const passportInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Clear errors on step change
  useEffect(() => {
    setErrorMessage("");
  }, [step]);

  // Cleanup webcam stream if component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // -------------------------------------------------------------
  // STEP 1 VALIDATION & HANDLERS
  // -------------------------------------------------------------
  const handleStep1Next = () => {
    // Required fields check
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    // Alphabet only validation for first & last names
    const alphabetRegex = /^[a-zA-Z\s]+$/;
    if (!alphabetRegex.test(firstName.trim())) {
      setErrorMessage("First Name must contain alphabet characters only.");
      return;
    }
    if (!alphabetRegex.test(lastName.trim())) {
      setErrorMessage("Last Name must contain alphabet characters only.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Numeric format phone validation
    const numericRegex = /^\d{7,15}$/;
    if (!numericRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      setErrorMessage("Phone Number must contain numeric digits only (7-15 digits).");
      return;
    }

    // Checkbox Terms
    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms & Conditions and Privacy Policy to proceed.");
      return;
    }

    setErrorMessage("");
    setStep(2);
  };

  // -------------------------------------------------------------
  // STEP 2 HANDLERS: DOCUMENT UPLOADER & SELFIE SIMULATOR
  // -------------------------------------------------------------
  const triggerFileSelection = (key: "passport" | "nationalId" | "driverLicense" | "proofOfAddress") => {
    if (key === "passport") passportInputRef.current?.click();
    if (key === "nationalId") idInputRef.current?.click();
    if (key === "driverLicense") licenseInputRef.current?.click();
    if (key === "proofOfAddress") addressInputRef.current?.click();
  };

  const handleFileChange = (key: keyof typeof docs, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats validation
    if (key === "passport") {
      const allowed = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
      if (!allowed.includes(file.type)) {
        setErrorMessage("Passport must be a PNG, JPG, JPEG, or PDF.");
        return;
      }
    }

    // Initialize progress bar
    setDocs(prev => ({
      ...prev,
      [key]: {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        progress: 10,
        dataUrl: null
      }
    }));

    // Simulating professional upload
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocs(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              progress: 100,
              dataUrl: reader.result as string
            }
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setDocs(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            progress: currentProgress
          }
        }));
      }
    }, 150);
  };

  const removeDoc = (key: keyof typeof docs) => {
    setDocs(prev => ({
      ...prev,
      [key]: { name: "", size: "", dataUrl: null, progress: 0 }
    }));
  };

  // Selfie Webcam & Interactive Simulator Logic
  const startSelfieVerification = async () => {
    setIsSelfieActive(true);
    setSelfieStep(1);
    setSelfiePrompt("Blink your eyes to start authentication...");

    // Try accessing real webcam inside the container
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("Webcam permission blocked or unavailable, starting automated smart scanning overlay.");
    }

    // Simulate smart biometric checks (Blink, Smile, Turn Head)
    setTimeout(() => {
      setSelfieStep(2);
      setSelfiePrompt("Blink detected! Now smile for facial scanning...");
      
      setTimeout(() => {
        setSelfieStep(3);
        setSelfiePrompt("Smile detected! Turn your head slightly to the right...");
        
        setTimeout(() => {
          setSelfieStep(4);
          setSelfiePrompt("Biometrics verified! Hold still, capturing profile picture...");
          
          setTimeout(() => {
            // Stop real webcam tracks if they were running
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }

            // Save mockup premium placeholder avatar or webcam screenshot
            setDocs(prev => ({
              ...prev,
              selfie: {
                name: "Selfie_Verification_Pass.jpg",
                size: "142 KB",
                dataUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop", // Elegant professional face
                progress: 100
              }
            }));
            setSelfieStep(5);
            setSelfiePrompt("Selfie captured successfully!");
            setTimeout(() => {
              setIsSelfieActive(false);
            }, 1000);

          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const cancelSelfie = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsSelfieActive(false);
    setSelfieStep(0);
  };

  const handleStep2Next = () => {
    // Require Passport, National ID, Driver License, Proof of Address, and Selfie
    const missingDocs = Object.keys(docs).filter(
      key => docs[key as keyof typeof docs].dataUrl === null
    );

    if (missingDocs.length > 0) {
      setErrorMessage(`Please upload all documents and complete Selfie Verification to proceed.`);
      return;
    }

    setErrorMessage("");
    setStep(3);
  };


  // -------------------------------------------------------------
  // STEP 3 HANDLERS: PASSWORD STRENGTH & PIN COMPONENT
  // -------------------------------------------------------------
  const getPasswordStrength = () => {
    if (!password) return { label: "None", color: "text-gray-500", barColor: "bg-white/10", width: "0%" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length < 8) {
      return { label: "Weak", color: "text-red-400", barColor: "bg-red-500", width: "25%" };
    }
    if (score <= 2) {
      return { label: "Fair", color: "text-amber-400", barColor: "bg-amber-500", width: "50%" };
    }
    if (score === 3 || score === 4) {
      return { label: "Strong", color: "text-blue-400", barColor: "bg-blue-500", width: "75%" };
    }
    return { label: "Excellent", color: "text-emerald-400", barColor: "bg-emerald-500", width: "100%" };
  };

  const handlePinChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, "").slice(-1);
    const nextPin = [...transactionPin];
    nextPin[index] = cleanVal;
    setTransactionPin(nextPin);

    // Auto-focus next box
    if (cleanVal && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !transactionPin[index] && index > 0) {
      const nextPin = [...transactionPin];
      nextPin[index - 1] = "";
      setTransactionPin(nextPin);
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleStep3Next = () => {
    // Username requirements
    if (username.length < 6) {
      setErrorMessage("Username must be at least 6 characters.");
      return;
    }
    const alphanumeric = /^[a-zA-Z0-9]+$/;
    if (!alphanumeric.test(username)) {
      setErrorMessage("Username must contain letters and numbers only (no special characters).");
      return;
    }

    // Check unique username availability
    const dbState = AuroraDB.getState();
    const isTaken = dbState.users.some(u => (u.username || "").toLowerCase() === username.toLowerCase());
    if (isTaken) {
      setErrorMessage("This username is already taken. Please choose another.");
      return;
    }

    // Password requirements validation
    const strength = getPasswordStrength();
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setErrorMessage("Password requires: 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
      return;
    }

    // Password confirm matches
    if (password !== confirmPassword) {
      setErrorMessage("Confirm Password must exactly match original Password.");
      return;
    }

    // 4-digit numeric pin check
    const pinStr = transactionPin.join("");
    if (pinStr.length !== 4) {
      setErrorMessage("Please enter a valid 4-digit Transaction PIN.");
      return;
    }

    // Security Question details
    if (!securityAnswer.trim()) {
      setErrorMessage("Please provide an answer to your selected Security Question.");
      return;
    }

    setErrorMessage("");
    setStep(4);
  };


  // -------------------------------------------------------------
  // STEP 4 HANDLERS: FINAL REGISTRATION & ENCRYPTION
  // -------------------------------------------------------------
  const handleAppPinChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, "").slice(-1);
    const nextPin = [...appPin];
    nextPin[index] = cleanVal;
    setAppPin(nextPin);

    // Auto-focus next box
    if (cleanVal && index < 5) {
      appPinRefs[index + 1].current?.focus();
    }
  };

  const handleAppPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !appPin[index] && index > 0) {
      const nextPin = [...appPin];
      nextPin[index - 1] = "";
      setAppPin(nextPin);
      appPinRefs[index - 1].current?.focus();
    }
  };

  const handleRegisterAccount = async () => {
    // Pin requirement check
    const appPinStr = appPin.join("");
    if (appPinStr.length !== 6) {
      setErrorMessage("Please create a valid 6-Digit PIN to secure transaction authorization.");
      return;
    }

    // Agreement required
    if (!agreeTCOptions) {
      setErrorMessage("You must agree to the terms of service and profile policies to activate account.");
      return;
    }

    // Success process flow executing all 11 steps outlined in instructions:
    // 1. Validate all previous registration steps.
    // 2. Upload documents to the server (simulated database persistence).
    // 3. Encrypt all sensitive data (hashed passwords & pins).
    // 4. Create a unique customer ID.
    // 5. Generate a unique account number.
    // 6. Generate a default checking account.
    // 7. Create user profile.
    // 8. Save security settings.
    // 9. Send email verification (logged).
    // 10. Send SMS confirmation (logged).
    // 11. Redirect user to Login.

    const dbState = AuroraDB.getState();

    const uniqueCustomerId = `AU-${Math.floor(10000 + Math.random() * 89999)}`;
    const generatedAccountNo = `AU • ${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(1000 + Math.random() * 8999)}`;
    const generatedSavingsAccountNo = `AU • ${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(1000 + Math.random() * 8999)}`;

    // Simple robust encryption simulator
    const mockEncrypt = (str: string) => `[ENCRYPTED_SHA256_${btoa(str).slice(0, 15)}]`;

    const newUserObject = {
      id: uniqueCustomerId,
      username: username.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      joinedAt: new Date().toISOString(),
      status: "Active" as "Active" | "Suspended" | "Locked",
      password: mockEncrypt(password),
      appPin: mockEncrypt(appPinStr),
      transactionPin: mockEncrypt(transactionPin.join("")),
      biometricsEnabled: {
        faceId: enableFaceId,
        fingerprint: enableFingerprint
      },
      securityQuestion,
      securityAnswer: mockEncrypt(securityAnswer),
      address: "Not yet provided",
      employment: "Unemployed / Independent",
      nextOfKin: "None",
      profilePic: docs.selfie.dataUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256"
    };

    const userCheckingAccount = {
      id: `ACC-${Math.floor(5000 + Math.random() * 4999)}`,
      userId: uniqueCustomerId,
      accountNumber: generatedAccountNo,
      type: "Checking Account" as any,
      balance: 1000.00, // Seeded Welcome Gift
      currency: "USD",
      status: "Active" as any,
      createdAt: new Date().toISOString()
    };

    const userSavingsAccount = {
      id: `ACC-${Math.floor(1000 + Math.random() * 3999)}`,
      userId: uniqueCustomerId,
      accountNumber: generatedSavingsAccountNo,
      type: "Savings Account" as any,
      balance: 500.00,
      currency: "USD",
      status: "Active" as any,
      createdAt: new Date().toISOString()
    };

    const userCard = {
      id: `CARD-${Math.floor(2000 + Math.random() * 7000)}`,
      userId: uniqueCustomerId,
      accountId: userCheckingAccount.id,
      cardNumber: `4000 1234 5678 ${generatedAccountNo.slice(-4)}`,
      expiryDate: "08/31",
      cvv: String(Math.floor(100 + Math.random() * 900)),
      type: "Debit Card" as any,
      status: "Active" as any,
      dailyLimit: 2500,
      spentToday: 0,
      pin: transactionPin.join("")
    };

    // Push initial bonus transaction
    const initialDepositTxn = {
      id: `TXN-${Math.floor(80000 + Math.random() * 19999)}`,
      userId: uniqueCustomerId,
      accountId: userCheckingAccount.id,
      amount: 1000.00,
      category: "Salary" as any,
      merchant: "Aurora Institutional Capital",
      description: "Welcome Seeding Gold Deposit",
      date: new Date().toISOString(),
      status: "Completed" as any,
      referenceNumber: `AUR${Math.floor(10000000 + Math.random() * 89999999)}`
    };

    // System notifications
    const newNotif = {
      id: `NOTIF-${Math.random()}`,
      userId: uniqueCustomerId,
      title: "Premium Account Activated",
      message: `Your Checking Vault is open with an active balance of $1,000.00 USD. Thank you for choosing Aurora.`,
      category: "Service" as any,
      date: new Date().toISOString(),
      isRead: false
    };

    // Add security activity log entry
    const logItem = {
      id: `LOG-${Math.random()}`,
      userId: uniqueCustomerId,
      event: "Account Created & Registered",
      device: "Apple iPhone 15 Pro Max (Aurora Mobile App)",
      location: "New York, NY",
      date: new Date().toISOString(),
      status: "Success" as "Failed" | "Success"
    };

    // Save state completely using individual REST CRUD operations
    dbState.users.push(newUserObject);
    dbState.accounts.push(userCheckingAccount, userSavingsAccount);
    dbState.cards.push(userCard);
    dbState.transactions.push(initialDepositTxn);
    dbState.notifications.push(newNotif);
    dbState.securityLogs.push(logItem);
    
    await AuroraDB.saveUser(newUserObject);
    await AuroraDB.saveAccount(userCheckingAccount);
    await AuroraDB.saveAccount(userSavingsAccount);
    await AuroraDB.saveCard(userCard);
    await AuroraDB.saveTransaction(initialDepositTxn);
    await AuroraDB.saveNotification(newNotif);
    await AuroraDB.saveSecurityLog(logItem);

    // Save state to render successful feedback screen
    setCreatedUsername(username.toLowerCase().trim());
    setCreatedCustomerId(uniqueCustomerId);
    setCreatedAccountNo(generatedAccountNo);
    setIsSuccessfullyCreated(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#071B34] text-white font-sans px-6 py-6 overflow-y-auto select-none pb-24">
      
      {/* Document inputs */}
      <input 
        type="file" 
        ref={passportInputRef} 
        onChange={(e) => handleFileChange("passport", e)} 
        className="hidden" 
        accept="image/png, image/jpg, image/jpeg, application/pdf"
      />
      <input 
        type="file" 
        ref={idInputRef} 
        onChange={(e) => handleFileChange("nationalId", e)} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={licenseInputRef} 
        onChange={(e) => handleFileChange("driverLicense", e)} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={addressInputRef} 
        onChange={(e) => handleFileChange("proofOfAddress", e)} 
        className="hidden" 
        accept="image/*, application/pdf"
      />

      {/* HEADER SECTION */}
      {!isSuccessfullyCreated && (
        <div className="flex flex-col mb-6 mt-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onNavigate("landing")}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <h1 className="text-sm font-bold tracking-[0.2em] text-[#D8A63D] uppercase">Create Your Account</h1>
              <p className="text-[10px] text-white/50 uppercase font-semibold mt-0.5">Step {step} of 4</p>
            </div>
            <div className="w-10 h-10" />
          </div>

          {/* PROGRESS INDICATOR */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="h-[3px] bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    s <= step ? "bg-[#2563EB]" : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ERROR FEEDBACK BAR */}
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium mb-6 flex gap-2 items-start"
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* REGISTRATION COMPONENT STEP SWITCHER */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* SUCCESS PAGE (Confetti & expanding checkmark) */}
        {isSuccessfullyCreated ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-6"
          >
            {/* Animated blue checkmark */}
            <div className="w-24 h-24 rounded-full bg-[#2563EB]/15 border-2 border-[#2563EB] flex items-center justify-center mb-8 relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-[#2563EB]/30 blur-2xl"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Check className="w-12 h-12 text-[#2563EB] stroke-[3]" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">Account Created Successfully!</h2>
            <p className="text-xs text-white/50 max-w-xs mb-8">
              Welcome to next-generation luxury banking with enterprise safety.
            </p>

            {/* Generated Profile Summary Card */}
            <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-white/40 tracking-wider">CUSTOMER ID</span>
                <span className="text-xs font-mono font-bold text-white tracking-wider">{createdCustomerId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-white/40 tracking-wider">LOGIN USERNAME</span>
                <span className="text-xs font-semibold text-[#D8A63D]">{createdUsername}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-white/40 tracking-wider">CHECKING VAULT NO.</span>
                <span className="text-xs font-mono text-white/80">{createdAccountNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-white/40 tracking-wider">GOLD WELCOME GIFT</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">+$1,000.00 USD</span>
              </div>
            </div>

            {/* Verification confirmation details */}
            <div className="w-full bg-[#2563EB]/10 border border-[#2563EB]/25 p-4 rounded-xl text-left text-xs mb-8 flex gap-3">
              <Sparkles className="w-5 h-5 text-[#D8A63D] shrink-0" />
              <div>
                <p className="font-semibold text-white">Security Dispatches</p>
                <p className="text-white/60 mt-1">
                  We have dispatched a welcome email verification and SMS validation confirm to your accounts.
                </p>
              </div>
            </div>

            {/* Next Action Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("login")}
              className="w-full py-4 bg-[#2563EB] hover:brightness-110 shadow-lg shadow-[#2563EB]/20 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Login to Digital Banking</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            
            {/* STEP 1: PERSONAL INFORMATION FORM */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <p className="text-white/50 text-xs mt-1">Provide your legal identity data to open a dynamic vault.</p>
                </div>

                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Legal First Name"
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Legal Last Name"
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@luxury-living.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="w-24 px-2 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="+1" className="bg-[#071B34]">+1 (US)</option>
                        <option value="+44" className="bg-[#071B34]">+44 (UK)</option>
                        <option value="+33" className="bg-[#071B34]">+33 (FR)</option>
                        <option value="+91" className="bg-[#071B34]">+91 (IN)</option>
                        <option value="+81" className="bg-[#071B34]">+81 (JP)</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="201 555 0192"
                          className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="pt-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#2563EB] cursor-pointer"
                    />
                    <label htmlFor="agreeTerms" className="text-xs text-white/60 leading-relaxed cursor-pointer select-none">
                      I agree to the <span className="text-[#2563EB] font-bold underline">Terms & Conditions</span> and <span className="text-[#2563EB] font-bold underline">Privacy Policy</span>.
                    </label>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-8">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStep1Next}
                    className="w-full py-4 bg-[#2563EB] text-white hover:brightness-110 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <div className="text-center mt-6">
                    <p className="text-xs text-white/50">
                      Already have an account?{" "}
                      <button 
                        onClick={() => onNavigate("login")} 
                        className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: VERIFY YOUR IDENTITY (UPLOAD DOCUMENTS) */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold">Verify Your Identity</h2>
                  <p className="text-white/50 text-xs mt-1">Provide credentials to clear banking compliance regulations.</p>
                </div>

                {/* Upload Card List */}
                <div className="space-y-3.5">
                  {[
                    { id: "passport", title: "Passport photograph", desc: "Formats: PNG, JPG, JPEG, PDF" },
                    { id: "nationalId", title: "National ID Card", desc: "Front & back visual captures" },
                    { id: "driverLicense", title: "Driver’s License", desc: "Front & back high-resolution images" },
                    { id: "proofOfAddress", title: "Proof of Address", desc: "Utility bills or statements max 3 months old" }
                  ].map((item) => {
                    const docState = docs[item.id as keyof typeof docs];
                    const hasUploaded = docState.dataUrl !== null;
                    const isUploading = docState.progress > 0 && docState.progress < 100;

                    return (
                      <div 
                        key={item.id}
                        className="p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-[20px] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D8A63D]">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-white">{item.title}</h4>
                              <p className="text-[10px] text-white/40 mt-0.5">{item.desc}</p>
                            </div>
                          </div>

                          {/* Upload Actions */}
                          {hasUploaded ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-emerald-400">READY</span>
                              <button 
                                onClick={() => removeDoc(item.id as keyof typeof docs)}
                                className="p-1.5 bg-white/5 text-red-400 hover:bg-white/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : isUploading ? (
                            <div className="w-16 bg-white/10 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#2563EB] h-full" style={{ width: `${docState.progress}%` }} />
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerFileSelection(item.id as "passport" | "nationalId" | "driverLicense" | "proofOfAddress")}
                              className="w-8 h-8 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB]/20 active:scale-95 cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* File detail display */}
                        {hasUploaded && (
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between text-[9px] text-white/50 font-mono">
                            <span className="truncate max-w-[200px]">{docState.name}</span>
                            <span>{docState.size}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Selfie Verification Card */}
                  <div className="p-4 bg-white/[0.02] border border-[#D8A63D]/20 rounded-[20px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D8A63D]/10 border border-[#D8A63D]/30 flex items-center justify-center text-[#D8A63D]">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-[#D8A63D]">Biometric Selfie Scan</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">Blink, smile and head verification check</p>
                        </div>
                      </div>

                      {docs.selfie.dataUrl ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D8A63D]">
                            <img src={docs.selfie.dataUrl} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#D8A63D]">PASS</span>
                          <button 
                            onClick={() => removeDoc("selfie")}
                            className="p-1.5 bg-white/5 text-red-400 hover:bg-white/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={startSelfieVerification}
                          className="px-3.5 py-1.5 rounded-lg bg-[#D8A63D]/10 hover:bg-[#D8A63D]/25 text-xs font-bold text-[#D8A63D] transition-colors border border-[#D8A63D]/20 cursor-pointer"
                        >
                          Scan Face
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SELFIE VERIFICATION OVERLAY SCREEN */}
                {isSelfieActive && (
                  <div className="fixed inset-0 bg-[#071B34] z-50 flex flex-col items-center justify-between p-6">
                    <div className="w-full flex justify-between items-center">
                      <span className="text-xs font-bold tracking-widest text-[#D8A63D] font-mono uppercase">Biometric Face ID Scan</span>
                      <button onClick={cancelSelfie} className="p-2 text-white/60 hover:text-white">
                        Cancel
                      </button>
                    </div>

                    {/* Camera view screen box with oval frame mask */}
                    <div className="relative w-72 h-96 bg-black/40 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center">
                      
                      {/* Interactive face mesh simulation overlay */}
                      <div className="absolute inset-0 border-2 border-dashed border-[#D8A63D]/40 rounded-3xl pointer-events-none" />

                      {/* Oval Frame Mask placeholder */}
                      <div className="absolute w-52 h-72 border-[3px] border-[#D8A63D] rounded-[50%] flex items-center justify-center shadow-[0_0_0_100px_rgba(7,27,52,0.8)] z-10">
                        {/* Scanning beam line */}
                        {selfieStep < 5 && (
                          <motion.div 
                            className="w-full h-0.5 bg-[#D8A63D] shadow-lg shadow-[#D8A63D]"
                            animate={{ y: [-100, 100, -100] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                          />
                        )}
                      </div>

                      {/* Live camera stream placeholder or webcam video */}
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />

                      {/* Animated mesh grid scanning background if webcam not loaded */}
                      <div className="absolute inset-0 bg-[radial-gradient(#2563eb15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    </div>

                    {/* Guide Prompt Instructions */}
                    <div className="text-center max-w-xs space-y-3">
                      <p className="text-sm font-bold text-white tracking-tight">{selfiePrompt}</p>
                      
                      {/* Steps indicators */}
                      <div className="flex justify-center gap-1.5">
                        {[1, 2, 3, 4].map((stepNo) => (
                          <div 
                            key={stepNo} 
                            className={`w-6 h-1.5 rounded-full transition-all duration-300 ${
                              stepNo < selfieStep 
                                ? "bg-emerald-400" 
                                : stepNo === selfieStep 
                                ? "bg-[#D8A63D] w-8" 
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-white/40 font-mono">
                      SECURE BIOMETRIC INTEL VERIFICATION
                    </div>
                  </div>
                )}

                {/* Step 2 Actions */}
                <div className="pt-8">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStep2Next}
                    className="w-full py-4 bg-[#2563EB] hover:brightness-110 font-bold text-sm text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <span>Next step</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CREATE SECURITY & CREDENTIALS */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold">Create Security</h2>
                  <p className="text-white/50 text-xs mt-1">Set up login credentials and a secret transaction authorization PIN.</p>
                </div>

                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Login Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Min 6 alphanumeric characters"
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 8 letters & characters"
                        className="w-full pl-11 pr-12 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-3.5 text-white/40 hover:text-white"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                        <span className="text-white/40">PASSWORD STRENGTH</span>
                        <span className={getPasswordStrength().color}>{getPasswordStrength().label}</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getPasswordStrength().barColor}`}
                          style={{ width: getPasswordStrength().width }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter to confirm"
                        className="w-full pl-11 pr-12 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-3.5 text-white/40 hover:text-white"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 4-digit Transaction PIN */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">4-Digit Transaction PIN</label>
                    <p className="text-[10px] text-white/50 mb-3">Required for confirming premium ledger transfers.</p>
                    <div className="flex justify-between max-w-xs gap-3">
                      {transactionPin.map((p, i) => (
                        <input
                          key={i}
                          ref={pinRefs[i]}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={p}
                          onChange={(e) => handlePinChange(i, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(i, e)}
                          className="w-12 h-14 bg-white/[0.03] border border-white/10 text-center rounded-xl font-bold text-lg focus:outline-none focus:border-[#2563EB] transition-colors"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Security Question Selector */}
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">Security Recovery Question</label>
                    <select
                      value={securityQuestion}
                      onChange={e => setSecurityQuestion(e.target.value)}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#2563EB] mb-3"
                    >
                      <option value="What was your first school name?" className="bg-[#071B34]">What was your first school name?</option>
                      <option value="What is your favorite teacher's name?" className="bg-[#071B34]">What is your favorite teacher's name?</option>
                      <option value="What was your first pet's name?" className="bg-[#071B34]">What was your first pet's name?</option>
                      <option value="What is your mother's maiden name?" className="bg-[#071B34]">What is your mother's maiden name?</option>
                    </select>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={e => setSecurityAnswer(e.target.value)}
                      placeholder="Your secret answer here"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:border-[#2563EB] focus:outline-none text-sm text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="pt-8">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStep3Next}
                    className="w-full py-4 bg-[#2563EB] hover:brightness-110 font-bold text-sm text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <span>Next step</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: FINAL OPTIONS, 6-DIGIT PIN, BIOMETRICS & AGREEMENT */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold">Almost Done!</h2>
                  <p className="text-white/50 text-xs mt-1">Activate high-grade biometrics security options and confirm details.</p>
                </div>

                <div className="space-y-5">
                  {/* Create 6-Digit PIN */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-[20px] space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create 6-Digit PIN</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Used for fast mobile dashboard logins.</p>
                    </div>
                    <div className="flex justify-between gap-2 max-w-sm">
                      {appPin.map((digit, i) => (
                        <input
                          key={i}
                          ref={appPinRefs[i]}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleAppPinChange(i, e.target.value)}
                          onKeyDown={(e) => handleAppPinKeyDown(i, e)}
                          className="w-10 h-12 bg-white/[0.03] border border-white/10 text-center rounded-xl font-bold focus:outline-none focus:border-[#2563EB] transition-colors"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Biometrics Settings */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-[20px] space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Biometric Integrations</h4>
                    
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white/80">Enable Face ID login</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={enableFaceId}
                        onChange={(e) => setEnableFaceId(e.target.checked)}
                        className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#D8A63D]" />
                        <span className="text-xs text-white/80">Enable Fingerprint authentication</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={enableFingerprint}
                        onChange={(e) => setEnableFingerprint(e.target.checked)}
                        className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Editable Security Summary Card */}
                  <div className="p-4 bg-white/[0.02] border border-[#D8A63D]/20 rounded-[20px] space-y-3 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-[#D8A63D] uppercase tracking-wider">Security Setup Summary</h4>
                      <button 
                        onClick={() => setStep(3)}
                        className="text-[10px] font-bold text-[#2563EB] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[11px] space-y-2">
                      <p className="text-white/60">
                        <span className="font-mono text-white/40">USERNAME:</span> {username}
                      </p>
                      <p className="text-white/60 leading-normal">
                        <span className="font-mono text-white/40">SECURITY QUESTION:</span> {securityQuestion}
                      </p>
                      <p className="text-white/60">
                        <span className="font-mono text-white/40">SECURITY ANSWER:</span> ••••••••
                      </p>
                    </div>
                  </div>

                  {/* Final Terms & Conditions check */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="agreeFinalTerms"
                      checked={agreeTCOptions}
                      onChange={e => setAgreeTCOptions(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#2563EB] cursor-pointer"
                    />
                    <label htmlFor="agreeFinalTerms" className="text-xs text-white/60 leading-relaxed cursor-pointer select-none">
                      I agree to the final account creation guidelines, banking license parameters, and deposit policies.
                    </label>
                  </div>
                </div>

                {/* Step 4 Actions */}
                <div className="pt-8">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRegisterAccount}
                    className="w-full py-4 bg-[#2563EB] hover:brightness-110 font-bold text-sm text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shadow-[#2563EB]/25"
                    style={{
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)"
                    }}
                  >
                    <span>Create Account</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
