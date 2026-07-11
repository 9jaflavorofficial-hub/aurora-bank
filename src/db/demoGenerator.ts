import {
  AccountType,
  AccountStatus,
  CardType,
  CardStatus,
  TransactionStatus,
  TransactionCategory,
  LoanStatus,
  InvestmentType,
  User,
  BankAccount,
  BankCard,
  Transaction,
  UserNotification,
  Loan,
  InvestmentAsset,
  SecurityLog
} from "../types";

// Lists for randomized demo profiling
const FIRST_NAMES_CIVILIAN = ["Benjamin", "Sarah", "Michael", "Sophia", "Alexander", "Emily", "David", "Jessica", "James", "Elena"];
const LAST_NAMES = ["Mercer", "Chen", "Kovacs", "Rodriguez", "Sterling", "Hayes", "Vance", "Gomez", "Patel", "Foster"];

const MILITARY_FIRST_NAMES = ["John", "Marcus", "Garrett", "Robert", "William", "Richard", "Thomas", "Elizabeth", "Kathleen", "Matthew"];
const MILITARY_RANKS = ["Captain", "Major", "First Sergeant", "Lieutenant Commander", "Master Chief", "Staff Sergeant", "Warrant Officer"];

const CIVILIAN_EMPLOYMENTS = [
  "Senior Software Engineer",
  "Lead UX Architect",
  "Director of Logistics",
  "Principal Research Analyst",
  "Chief Financial Analyst",
  "Clinical Research Director",
  "Senior Product Manager",
  "Vice President of Sales"
];

const CIVILIAN_EMPLOYERS = [
  "NexusTech Solutions",
  "Apex Financial Corp",
  "Vertex Biotech Industries",
  "GridScale Energy LLC",
  "Synthetix Robotics",
  "Vanguard Tech Systems",
  "Infinite Loop Software"
];

const ADDR_STREETS = [
  "742 Evergreen Terrace", "1284 Whispering Pines Dr", "405 Horizon View Lane",
  "982 Autumn Maple Court", "1420 Ironwood Circle", "883 Alpine Ridge Way",
  "1104 Ocean Breeze Blvd", "512 Pinecrest Overlook", "17 Kingswood Drive"
];

const ADDR_CITIES = [
  "Springfield, OR 97477", "Boulder, CO 80301", "Seattle, WA 98101",
  "Austin, TX 78701", "Boston, MA 02108", "Atlanta, GA 30301",
  "Alexandria, VA 22314", "San Diego, CA 92101", "Miami, FL 33101"
];

const PROFILE_PICS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // Female professional
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", // Male professional
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", // Female tech manager
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"  // Male engineer
];

export interface DemoConfig {
  employerName: string;
  salaryAmount: number;
  depositDay: number;
  isMilitary: boolean;
  firstName?: string;
  lastName?: string;
  userId?: string;
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string;
  employment?: string;
  profilePic?: string;
  joinedAt?: string;
}

export function generateDemoProfile(config: DemoConfig) {
  const userId = config.userId || `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Decide names based on configuration or random choice
  let firstName = config.firstName || "";
  let lastName = config.lastName || "";
  if (!firstName) {
    const fList = config.isMilitary ? MILITARY_FIRST_NAMES : FIRST_NAMES_CIVILIAN;
    firstName = fList[Math.floor(Math.random() * fList.length)];
  }
  if (!lastName) {
    lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  }

  const isElizabethIbarra = 
    (firstName.toUpperCase() === "ELIZABETH" && lastName.toUpperCase() === "IBARRA RODRIGUEZ") ||
    (firstName.toUpperCase() === "IBARRA RODRIGUEZ" && lastName.toUpperCase() === "ELIZABETH") ||
    (firstName.toUpperCase() + " " + lastName.toUpperCase()).includes("IBARRA RODRIGUEZ ELIZABETH") ||
    (lastName.toUpperCase() + " " + firstName.toUpperCase()).includes("IBARRA RODRIGUEZ ELIZABETH") ||
    (config.firstName?.toUpperCase().includes("ELIZABETH") && config.lastName?.toUpperCase().includes("IBARRA"));

  const baseUsername = config.username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(10 + Math.random() * 89)}`;
  const email = config.email || `${baseUsername}@demo-aurorabank.com`;
  const phone = config.phone || `+1 555-01${Math.floor(10 + Math.random() * 89)}`;
  
  const street = ADDR_STREETS[Math.floor(Math.random() * ADDR_STREETS.length)];
  const city = ADDR_CITIES[Math.floor(Math.random() * ADDR_CITIES.length)];
  const address = config.address || `${street}, ${city}`;

  const dobYear = 1975 + Math.floor(Math.random() * 20);
  const dobMonth = String(1 + Math.floor(Math.random() * 11)).padStart(2, "0");
  const dobDayStr = String(1 + Math.floor(Math.random() * 27)).padStart(2, "0");
  const dob = config.dob || `${dobYear}-${dobMonth}-${dobDayStr}`;

  let employment = config.employment || "";
  if (!employment) {
    if (config.isMilitary) {
      const rank = MILITARY_RANKS[Math.floor(Math.random() * MILITARY_RANKS.length)];
      employment = `${rank} (${config.employerName || "US Armed Forces"})`;
    } else {
      employment = `${CIVILIAN_EMPLOYMENTS[Math.floor(Math.random() * CIVILIAN_EMPLOYMENTS.length)]} at ${config.employerName || "NexusTech Solutions"}`;
    }
  }

  const profilePic = config.profilePic || PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)];

  // Create accounts
  const checkingAccountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
  const checkingAccount: BankAccount = {
    id: checkingAccountId,
    userId,
    accountNumber: `1000${Math.floor(10000000 + Math.random() * 90000000)}`,
    type: AccountType.CHECKING,
    balance: 0, // calculated from running sum
    currency: "USD",
    status: AccountStatus.ACTIVE,
    createdAt: "2017-01-01T09:00:00.000Z"
  };

  const savingsAccountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
  const savingsAccount: BankAccount = {
    id: savingsAccountId,
    userId,
    accountNumber: `2000${Math.floor(10000000 + Math.random() * 90000000)}`,
    type: AccountType.SAVINGS,
    balance: 0, // calculated from running sum
    currency: "USD",
    status: AccountStatus.ACTIVE,
    createdAt: "2017-01-01T09:15:00.000Z"
  };

  // Create cards
  const debitCard: BankCard = {
    id: `CARD-${Math.floor(100000 + Math.random() * 900000)}`,
    userId,
    accountId: checkingAccountId,
    cardNumber: `4000 ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`,
    expiryDate: "12/31",
    cvv: String(Math.floor(100 + Math.random()*900)),
    type: CardType.DEBIT,
    status: CardStatus.ACTIVE,
    dailyLimit: 5000,
    spentToday: 0,
    pin: "1234",
    isDefault: true
  };

  const creditCard: BankCard = {
    id: `CARD-${Math.floor(100000 + Math.random() * 900000)}`,
    userId,
    accountId: checkingAccountId,
    cardNumber: `5100 ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`,
    expiryDate: "12/31",
    cvv: String(Math.floor(100 + Math.random()*900)),
    type: CardType.CREDIT,
    status: CardStatus.ACTIVE,
    dailyLimit: 10000,
    spentToday: 0,
    pin: "4321",
    isDefault: false
  };

  // Create notifications
  const notifications: UserNotification[] = [
    {
      id: `NOTIF-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      title: "Welcome to Aurora Bank",
      message: `Dear ${firstName}, your premium banking credentials have been established. Your Client ID is ${userId}. Explore our dashboard for custom widgets, dynamic cards, and investments.`,
      category: "Security",
      date: new Date().toISOString(),
      isRead: false
    },
    {
      id: `NOTIF-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      title: "Security Shield Activated",
      message: "Biometric validation (FaceID / Fingerprint) has been paired with this session. Multi-factor login is now active.",
      category: "Security",
      date: new Date().toISOString(),
      isRead: false
    },
    {
      id: `NOTIF-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      title: "New Premium Debit Card Issued",
      message: `A Visa Debit card ending in ${debitCard.cardNumber.slice(-4)} was successfully linked to your checking account.`,
      category: "Security",
      date: new Date().toISOString(),
      isRead: true
    }
  ];

  // Optional Loan Facility
  const loans: Loan[] = [
    {
      id: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      type: "Mortgage Loan",
      amount: 320000,
      interestRate: 4.25,
      repaymentPeriod: 360,
      monthlyInstallment: 1574,
      status: LoanStatus.APPROVED,
      appliedDate: "2018-04-12T14:30:00.000Z",
      approvedDate: "2018-04-15T10:00:00.000Z",
      documents: [
        { name: "Deed_Of_Trust.pdf", url: "#" },
        { name: "Income_Verification.pdf", url: "#" }
      ]
    }
  ];

  // Optional Investment Portfolio
  const investments: InvestmentAsset[] = [
    {
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      type: InvestmentType.STOCK,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 45,
      buyPrice: 125.40,
      currentPrice: 220.30,
      investedAmount: 45 * 125.40,
      currentValue: 45 * 220.30,
      lastUpdated: new Date().toISOString()
    },
    {
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      type: InvestmentType.STOCK,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 35,
      buyPrice: 90.15,
      currentPrice: 185.50,
      investedAmount: 35 * 90.15,
      currentValue: 35 * 185.50,
      lastUpdated: new Date().toISOString()
    }
  ];

  // Generate transaction history from Jan 2017 to August 2024
  const transactions: Transaction[] = [];
  
  // Starting ledger balances
  let checkingLedger = 6500;
  let savingsLedger = 15000;

  // Track monthly names
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Year/Month Loop
  for (let year = 2017; year <= 2026; year++) {
    const endMonth = year === 2026 ? 7 : 12; // continue through July 2026 (current month)
    for (let month = 1; month <= endMonth; month++) {
      const monthStr = String(month).padStart(2, "0");
      const makeDate = (day: number) => {
        return `${year}-${monthStr}-${String(day).padStart(2, "0")}T12:00:00.000Z`;
      };

      // 1. SALARY DEPOSIT
      const salaryDate = makeDate(config.depositDay);
      
      const isElizabethIbarraActiveMilitary = isElizabethIbarra && year >= 2024;
      
      if (isElizabethIbarraActiveMilitary) {
        // Beginning January 2024 through July 2026, generate ONLY monthly "Military Salary Deposit" transactions.
        const salaryLabel = "Military Salary Deposit";
        const salaryMerchant = "Military Payroll";
        
        checkingLedger += config.salaryAmount;
        transactions.push({
          id: `TXN-${year}${monthStr}-01-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: config.salaryAmount,
          category: TransactionCategory.SALARY,
          merchant: salaryMerchant,
          description: salaryLabel,
          date: salaryDate,
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-SAL-${year}${monthStr}`
        });
        
        // Skip all outgoing/debit transactions to maintain only salary deposits
        continue;
      }
      
      const salaryLabel = isElizabethIbarra
        ? `${MONTH_NAMES[month - 1]} Salary`
        : (config.isMilitary
          ? `${MONTH_NAMES[month - 1]} Military Salary Deposit`
          : `${MONTH_NAMES[month - 1]} Salary`);
          
      const salaryMerchant = isElizabethIbarra
        ? (config.employerName || "Apex Financial Corp")
        : (config.isMilitary
          ? "Military Payroll"
          : config.employerName);

      checkingLedger += config.salaryAmount;
      transactions.push({
        id: `TXN-${year}${monthStr}-01-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: config.salaryAmount,
        category: TransactionCategory.SALARY,
        merchant: salaryMerchant,
        description: salaryLabel,
        date: salaryDate,
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-SAL-${year}${monthStr}`
      });

      // 2. MORTGAGE OR RENT EXPENSE
      const rentAmount = 1450 + Math.floor(Math.random() * 150);
      checkingLedger -= rentAmount;
      transactions.push({
        id: `TXN-${year}${monthStr}-02-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -rentAmount,
        category: TransactionCategory.UTILITIES,
        merchant: "Homeowners Realty",
        description: `${MONTH_NAMES[month - 1]} Rent / Mortgage Payment`,
        date: makeDate(1),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-RNT-${year}${monthStr}`
      });

      // 3. UTILITIES & BILLS (Electricity, Water, Internet, Mobile)
      const elecAmt = 75 + Math.floor(Math.random() * 35);
      checkingLedger -= elecAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-03-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -elecAmt,
        category: TransactionCategory.UTILITIES,
        merchant: "Power Grid Utility",
        description: "Electricity Bill Payment",
        date: makeDate(5),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-ELE-${year}${monthStr}`
      });

      const waterAmt = 30 + Math.floor(Math.random() * 15);
      checkingLedger -= waterAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-04-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -waterAmt,
        category: TransactionCategory.UTILITIES,
        merchant: "Municipal Water District",
        description: "Water & Sewage Utility",
        date: makeDate(6),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-WTR-${year}${monthStr}`
      });

      const internetAmt = 65 + Math.floor(Math.random() * 10);
      checkingLedger -= internetAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-05-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -internetAmt,
        category: TransactionCategory.UTILITIES,
        merchant: "Comcast Broadband",
        description: "High-Speed Internet Service",
        date: makeDate(8),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-NET-${year}${monthStr}`
      });

      const mobileAmt = 55 + Math.floor(Math.random() * 15);
      checkingLedger -= mobileAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-06-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -mobileAmt,
        category: TransactionCategory.UTILITIES,
        merchant: "Verizon Wireless",
        description: "Mobile Telecom Billing",
        date: makeDate(9),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-MOB-${year}${monthStr}`
      });

      const insuranceAmt = 110;
      checkingLedger -= insuranceAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-07-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -insuranceAmt,
        category: TransactionCategory.UTILITIES,
        merchant: "State Farm Insurance",
        description: "Comprehensive Premium Insurance",
        date: makeDate(10),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-INS-${year}${monthStr}`
      });

      // 4. GROCERIES (Costco, Walmart, Target)
      const costcoAmt = 180 + Math.floor(Math.random() * 120);
      checkingLedger -= costcoAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-08-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -costcoAmt,
        category: TransactionCategory.FOOD,
        merchant: "Costco Wholesale",
        description: "Bulk Grocery & Provisions",
        date: makeDate(12),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-CST-${year}${monthStr}`
      });

      const targetAmt = 45 + Math.floor(Math.random() * 60);
      checkingLedger -= targetAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-09-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -targetAmt,
        category: TransactionCategory.SHOPPING,
        merchant: "Target Store",
        description: "General Household Shopping",
        date: makeDate(17),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-TGT-${year}${monthStr}`
      });

      const walmartAmt = 60 + Math.floor(Math.random() * 50);
      checkingLedger -= walmartAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-10-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -walmartAmt,
        category: TransactionCategory.FOOD,
        merchant: "Walmart Supercenter",
        description: "Weekly Food Provisions",
        date: makeDate(24),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-WMT-${year}${monthStr}`
      });

      // 5. RETAIL & AMAZON
      const amazonAmt = 25 + Math.floor(Math.random() * 110);
      checkingLedger -= amazonAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-11-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -amazonAmt,
        category: TransactionCategory.SHOPPING,
        merchant: "Amazon Prime Retail",
        description: "Online E-Commerce Order",
        date: makeDate(15),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-AMZ-${year}${monthStr}`
      });

      // 6. DINING & RESTAURANTS
      const diningAmt = 40 + Math.floor(Math.random() * 80);
      checkingLedger -= diningAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-12-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -diningAmt,
        category: TransactionCategory.FOOD,
        merchant: "Local Bistro & Lounge",
        description: "Dining Out & Restaurant Services",
        date: makeDate(18),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-DIN-${year}${monthStr}`
      });

      // 7. TRANSPORT & GAS
      const fuelAmt = 35 + Math.floor(Math.random() * 20);
      checkingLedger -= fuelAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-13-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -fuelAmt,
        category: TransactionCategory.TRAVEL,
        merchant: "Shell Fueling Station",
        description: "Unleaded Automotive Refuel",
        date: makeDate(11),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-SHL-${year}${monthStr}`
      });

      // 8. SUBSCRIPTIONS
      const subAmt = 15;
      checkingLedger -= subAmt;
      transactions.push({
        id: `TXN-${year}${monthStr}-14-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -subAmt,
        category: TransactionCategory.UTILITIES,
        merchant: "Netflix Streaming",
        description: "Monthly Entertainment Subscription",
        date: makeDate(14),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-NFL-${year}${monthStr}`
      });

      // 9. RECURRING P2P TRANSFER OR SAVINGS TRSF
      const savingsTrsf = 200 + Math.floor(Math.random() * 300);
      checkingLedger -= savingsTrsf;
      savingsLedger += savingsTrsf;

      // Transfer OUT of checking
      transactions.push({
        id: `TXN-${year}${monthStr}-15-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: checkingAccountId,
        amount: -savingsTrsf,
        category: TransactionCategory.TRANSFER,
        merchant: "Internal Transfer",
        description: "Automated Allocation to Savings",
        date: makeDate(28),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-[#TRSF-${year}${monthStr}]`
      });

      // Transfer IN to savings
      transactions.push({
        id: `TXN-${year}${monthStr}-16-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        accountId: savingsAccountId,
        amount: savingsTrsf,
        category: TransactionCategory.TRANSFER,
        merchant: "Internal Transfer",
        description: "Incoming Allocation from Checking",
        date: makeDate(28),
        status: TransactionStatus.COMPLETED,
        referenceNumber: `REF-[#TRSF-${year}${monthStr}]`
      });

      // 10. OCCASIONAL ATM CASH WITHDRAWAL
      if (month % 2 === 0) {
        const atmAmt = 100;
        checkingLedger -= atmAmt;
        transactions.push({
          id: `TXN-${year}${monthStr}-17-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: -atmAmt,
          category: TransactionCategory.TRANSFER,
          merchant: "ATM Cash Withdrawal",
          description: "Aurora Bank ATM Cash Dispensation",
          date: makeDate(26),
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-ATM-${year}${monthStr}`
        });
      }

      // 11. OCCASIONAL PHARMACY / MEDICAL BILLS (Every 4 months)
      if (month % 4 === 0) {
        const medicalAmt = 45 + Math.floor(Math.random() * 80);
        checkingLedger -= medicalAmt;
        transactions.push({
          id: `TXN-${year}${monthStr}-18-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: -medicalAmt,
          category: TransactionCategory.UTILITIES,
          merchant: "Walgreens Pharmacy",
          description: "Prescriptions & Medical Care",
          date: makeDate(19),
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-RX-${year}${monthStr}`
        });
      }

      // 12. SPECIAL EVENTS: VACATIONS IN SUMMER & WINTER (June, December)
      if (month === 6 || month === 12) {
        const airlineAmt = 350 + Math.floor(Math.random() * 150);
        const hotelAmt = 280 + Math.floor(Math.random() * 120);
        
        checkingLedger -= (airlineAmt + hotelAmt);
        
        transactions.push({
          id: `TXN-${year}${monthStr}-19-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: -airlineAmt,
          category: TransactionCategory.TRAVEL,
          merchant: "Delta Air Lines",
          description: "Flight Booking Reservation",
          date: makeDate(21),
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-DAL-${year}${monthStr}`
        });

        transactions.push({
          id: `TXN-${year}${monthStr}-20-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: -hotelAmt,
          category: TransactionCategory.TRAVEL,
          merchant: "Marriott Hotels Resorts",
          description: "Lodging & Accommodations",
          date: makeDate(23),
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-MAR-${year}${monthStr}`
        });
      }

      // 13. TAX REFUNDS & BONUSES (March, December)
      if (month === 3) {
        const refundAmt = 1250;
        checkingLedger += refundAmt;
        transactions.push({
          id: `TXN-${year}${monthStr}-21-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: refundAmt,
          category: TransactionCategory.SALARY,
          merchant: "IRS Tax Refund",
          description: "US Treasury Tax Disbursement",
          date: makeDate(20),
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-TAX-${year}`
        });
      }

      if (month === 12) {
        const bonusAmt = 1800 + Math.floor(Math.random() * 1000);
        checkingLedger += bonusAmt;
        transactions.push({
          id: `TXN-${year}${monthStr}-22-${Math.floor(1000 + Math.random() * 9000)}`,
          userId,
          accountId: checkingAccountId,
          amount: bonusAmt,
          category: TransactionCategory.SALARY,
          merchant: "Corporate Bonus Division",
          description: `${year} Annual Performance Bonus`,
          date: makeDate(20),
          status: TransactionStatus.COMPLETED,
          referenceNumber: `REF-BNS-${year}`
        });
      }
    }
  }

  // Assign ledger balances to complete mathematical consistency!
  checkingAccount.balance = Math.round(checkingLedger * 100) / 100;
  savingsAccount.balance = Math.round(savingsLedger * 100) / 100;

  // Build password & login credentials
  const defaultPassword = "DemoUser2026";
  const userObj: User = {
    id: userId,
    username: baseUsername,
    firstName,
    lastName,
    email,
    phone,
    profilePic,
    joinedAt: "2017-01-01T08:00:00.000Z",
    status: "Active",
    password: defaultPassword,
    appPin: "123456",
    transactionPin: "1111",
    biometricsEnabled: { faceId: true, fingerprint: true },
    securityQuestion: "What was the name of your first school?",
    securityAnswer: "Aurora Academy",
    address,
    dob,
    employment,
    preferredCurrency: "USD"
  };

  return {
    user: userObj,
    accounts: [checkingAccount, savingsAccount],
    cards: [debitCard, creditCard],
    transactions,
    notifications,
    loans,
    investments,
    defaultPassword
  };
}
