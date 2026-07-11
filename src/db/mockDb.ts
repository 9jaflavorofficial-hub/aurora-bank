import {
  User,
  Admin,
  BankAccount,
  BankCard,
  Transaction,
  Beneficiary,
  Loan,
  InvestmentAsset,
  SupportTicket,
  UserNotification,
  SecurityLog,
  AuditLog,
  Branch,
  Employee
} from "../types";

export interface SystemState {
  users: User[];
  admins: Admin[];
  accounts: BankAccount[];
  cards: BankCard[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  loans: Loan[];
  investments: InvestmentAsset[];
  tickets: SupportTicket[];
  notifications: UserNotification[];
  securityLogs: SecurityLog[];
  auditLogs: AuditLog[];
  branches: Branch[];
  employees: Employee[];
}

export class AuroraDB {
  private static stateCache: SystemState | null = null;
  private static isPolling = false;
  private static activeSavesCount = 0;

  // Asynchronously fetch the initial state from the server before React renders
  static async init(): Promise<SystemState> {
    if (!this.stateCache) {
      this.stateCache = {
        users: [],
        admins: [],
        accounts: [],
        cards: [],
        transactions: [],
        beneficiaries: [],
        loans: [],
        investments: [],
        tickets: [],
        notifications: [],
        securityLogs: [],
        auditLogs: [],
        branches: [],
        employees: []
      };
    }

    // Fetch the fresh database state from the server asynchronously
    await this.syncFreshStateFromServer();

    // Subscribe to Server-Sent Events (SSE) for real-time push synchronization
    this.subscribeSSE();

    // Start background polling (every 3 seconds) as a fallback sync channel
    this.startBackgroundPolling();

    return this.stateCache;
  }

  // Fetch the latest state from the SQLite server and update our local cache cleanly
  private static async syncFreshStateFromServer(): Promise<SystemState | null> {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn("State fetch was intercepted by the preview security gateway.");
          return null;
        }
        const freshState = await res.json();
        this.stateCache = freshState;

        window.dispatchEvent(new CustomEvent("aurora_db_updated"));
        return freshState;
      }
    } catch (err) {
      console.error("Failed to fetch fresh state from server", err);
    }
    return null;
  }

  // Subscribes to real-time events from the backend via Server-Sent Events (SSE)
  private static subscribeSSE() {
    try {
      const eventSource = new EventSource("/api/events");
      
      eventSource.onmessage = async (event) => {
        try {
          // If we are currently pushing changes to the server, do not overwrite our local memory cache
          if (this.activeSavesCount > 0) {
            return;
          }

          const data = JSON.parse(event.data);
          if (data && data.updated) {
            await this.syncFreshStateFromServer();
          }
        } catch (err) {
          console.error("Error processing SSE message", err);
        }
      };

      eventSource.onerror = () => {
        // Silent recovery - EventSource automatically reconnects under the hood
      };
    } catch (e) {
      console.error("Failed to initialize SSE client", e);
    }
  }

  // Returns current in-memory cached state immediately (used synchronously by React)
  static getState(): SystemState {
    if (!this.stateCache) {
      return {
        users: [],
        admins: [],
        accounts: [],
        cards: [],
        transactions: [],
        beneficiaries: [],
        loans: [],
        investments: [],
        tickets: [],
        notifications: [],
        securityLogs: [],
        auditLogs: [],
        branches: [],
        employees: []
      };
    }
    return this.stateCache;
  }



  // REST CRUD: Individual user save
  static async saveUser(user: User): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.stateCache.users[idx] = user;
    } else {
      this.stateCache.users.push(user);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      if (!res.ok) {
        await fetch(`/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save user", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual user delete
  static async deleteUser(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.users = this.stateCache.users.filter(u => u.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete user", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual account save
  static async saveAccount(acc: BankAccount): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.accounts.findIndex(a => a.id === acc.id);
    if (idx !== -1) {
      this.stateCache.accounts[idx] = acc;
    } else {
      this.stateCache.accounts.push(acc);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/accounts/${acc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(acc)
      });
      if (!res.ok) {
        await fetch(`/api/accounts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(acc)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save account", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual account delete
  static async deleteAccount(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.accounts = this.stateCache.accounts.filter(a => a.id !== id);
    this.stateCache.transactions = this.stateCache.transactions.filter(t => t.accountId !== id);
    this.stateCache.cards = this.stateCache.cards.filter(c => c.accountId !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete account", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual card save
  static async saveCard(card: BankCard): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.cards.findIndex(c => c.id === card.id);
    if (idx !== -1) {
      this.stateCache.cards[idx] = card;
    } else {
      this.stateCache.cards.push(card);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card)
      });
      if (!res.ok) {
        await fetch(`/api/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save card", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual card delete
  static async deleteCard(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.cards = this.stateCache.cards.filter(c => c.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/cards/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete card", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual transaction save
  static async saveTransaction(tx: Transaction): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.transactions.findIndex(t => t.id === tx.id);
    if (idx !== -1) {
      this.stateCache.transactions[idx] = tx;
    } else {
      this.stateCache.transactions.unshift(tx);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx)
      });
      if (!res.ok) {
        await fetch(`/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tx)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save transaction", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual transaction delete
  static async deleteTransaction(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.transactions = this.stateCache.transactions.filter(t => t.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete transaction", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual beneficiary save
  static async saveBeneficiary(b: Beneficiary): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.beneficiaries.findIndex(item => item.id === b.id);
    if (idx !== -1) {
      this.stateCache.beneficiaries[idx] = b;
    } else {
      this.stateCache.beneficiaries.push(b);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/beneficiaries/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b)
      });
      if (!res.ok) {
        await fetch(`/api/beneficiaries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save beneficiary", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual beneficiary delete
  static async deleteBeneficiary(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.beneficiaries = this.stateCache.beneficiaries.filter(b => b.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/beneficiaries/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete beneficiary", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual loan save
  static async saveLoan(l: Loan): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.loans.findIndex(item => item.id === l.id);
    if (idx !== -1) {
      this.stateCache.loans[idx] = l;
    } else {
      this.stateCache.loans.push(l);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/loans/${l.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(l)
      });
      if (!res.ok) {
        await fetch(`/api/loans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(l)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save loan", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual loan delete
  static async deleteLoan(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.loans = this.stateCache.loans.filter(l => l.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/loans/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete loan", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual investment save
  static async saveInvestment(i: InvestmentAsset): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.investments.findIndex(item => item.id === i.id);
    if (idx !== -1) {
      this.stateCache.investments[idx] = i;
    } else {
      this.stateCache.investments.push(i);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/investments/${i.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(i)
      });
      if (!res.ok) {
        await fetch(`/api/investments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(i)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save investment", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual investment delete
  static async deleteInvestment(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.investments = this.stateCache.investments.filter(i => i.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/investments/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete investment", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual notification save
  static async saveNotification(n: UserNotification): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.notifications.findIndex(item => item.id === n.id);
    if (idx !== -1) {
      this.stateCache.notifications[idx] = n;
    } else {
      this.stateCache.notifications.unshift(n);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/notifications/${n.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n)
      });
      if (!res.ok) {
        await fetch(`/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save notification", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual notification delete
  static async deleteNotification(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.notifications = this.stateCache.notifications.filter(n => n.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete notification", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual ticket save
  static async saveTicket(t: SupportTicket): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.tickets.findIndex(item => item.id === t.id);
    if (idx !== -1) {
      this.stateCache.tickets[idx] = t;
    } else {
      this.stateCache.tickets.unshift(t);
    }
    this.activeSavesCount++;
    try {
      const res = await fetch(`/api/support/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t)
      });
      if (!res.ok) {
        await fetch(`/api/support`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t)
        });
      }
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save support ticket", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual ticket delete
  static async deleteTicket(id: string): Promise<void> {
    if (!this.stateCache) return;
    this.stateCache.tickets = this.stateCache.tickets.filter(t => t.id !== id);
    this.activeSavesCount++;
    try {
      await fetch(`/api/support/${id}`, { method: "DELETE" });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to delete support ticket", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual security log save
  static async saveSecurityLog(sl: SecurityLog): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.securityLogs.findIndex(item => item.id === sl.id);
    if (idx !== -1) {
      this.stateCache.securityLogs[idx] = sl;
    } else {
      this.stateCache.securityLogs.unshift(sl);
    }
    this.activeSavesCount++;
    try {
      await fetch(`/api/securityLogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sl)
      });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save security log", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  // REST CRUD: Individual audit log save
  static async saveAuditLog(al: AuditLog): Promise<void> {
    if (!this.stateCache) return;
    const idx = this.stateCache.auditLogs.findIndex(item => item.id === al.id);
    if (idx !== -1) {
      this.stateCache.auditLogs[idx] = al;
    } else {
      this.stateCache.auditLogs.unshift(al);
    }
    this.activeSavesCount++;
    try {
      await fetch(`/api/auditLogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(al)
      });
      this.updateLocalCache();
    } catch (e) {
      console.error("Failed to save audit log", e);
    } finally {
      this.activeSavesCount = Math.max(0, this.activeSavesCount - 1);
    }
  }

  private static updateLocalCache() {
    window.dispatchEvent(new CustomEvent("aurora_db_updated"));
  }

  // Polls the server every 3 seconds for seamless real-time multi-device sync
  private static startBackgroundPolling() {
    if (this.isPolling) return;
    this.isPolling = true;

    setInterval(async () => {
      try {
        // If we are currently pushing changes to the server, do not overwrite our local memory cache
        if (this.activeSavesCount > 0) {
          return;
        }

        const res = await fetch("/api/state");
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            return;
          }
          const freshState = await res.json();
          if (freshState) {
            this.stateCache = freshState;
            window.dispatchEvent(new CustomEvent("aurora_db_updated"));
          }
        }
      } catch (err) {
        console.error("Polling sync error", err);
      }
    }, 3000);
  }

  // Reuse the original generators if needed by the SQLite seeder
  static generateSeedData() {
    const alexUserId = "AUR-908273";
    const sarahUserId = "AUR-482019";
    const marcusUserId = "AUR-712893";

    const users: User[] = [
      {
        id: alexUserId,
        username: "alexjohnson",
        firstName: "Alex",
        lastName: "Johnson",
        email: "alex.johnson@aurorabank.com",
        phone: "+1 (202) 555-0147",
        profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop",
        joinedAt: "2016-04-12T08:30:00Z",
        status: "Active",
        password: "",
        appPin: "123456",
        transactionPin: "1234",
        biometricsEnabled: {
          faceId: true,
          fingerprint: true
        },
        securityQuestion: "What was your first pet's name?",
        securityAnswer: "Bella",
        address: "125 Financial Street, New York, NY 10005",
        employment: "Senior Design Director",
        nextOfKin: "Sarah Johnson (Sister)",
        preferredCurrency: "USD"
      },
      {
        id: sarahUserId,
        username: "sarahconnor",
        firstName: "Sarah",
        lastName: "Connor",
        email: "sarah.connor@aurorabank.com",
        phone: "+1 (310) 555-0199",
        profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&fit=crop",
        joinedAt: "2017-09-18T10:00:00Z",
        status: "Active",
        password: "",
        appPin: "654321",
        transactionPin: "4321",
        biometricsEnabled: {
          faceId: true,
          fingerprint: true
        },
        securityQuestion: "In what city did you meet your spouse?",
        securityAnswer: "Los Angeles",
        address: "842 Santa Monica Blvd, West Hollywood, CA 90069",
        employment: "Lead Security Architect",
        nextOfKin: "John Connor (Son)",
        preferredCurrency: "EUR"
      },
      {
        id: marcusUserId,
        username: "marcura",
        firstName: "Marcus",
        lastName: "Aurelius",
        email: "marcus.aurelius@aurorabank.com",
        phone: "+1 (415) 555-0182",
        profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop",
        joinedAt: "2018-05-04T08:00:00Z",
        status: "Active",
        password: "",
        appPin: "111111",
        transactionPin: "1111",
        biometricsEnabled: {
          faceId: true,
          fingerprint: true
        },
        securityQuestion: "What was the name of your first school?",
        securityAnswer: "Rome Academy",
        address: "750 California St, San Francisco, CA 94108",
        employment: "Executive Chairman",
        nextOfKin: "Lucilla Aurelius (Daughter)",
        preferredCurrency: "GBP"
      }
    ];

    const admins: Admin[] = [
      {
        username: "admin",
        fullName: "Victoria Stirling",
        role: "Chief Operations Officer"
      }
    ];

    const accounts: BankAccount[] = [
      {
        id: "ACC-5521",
        userId: alexUserId,
        accountNumber: "•••• •••• 4587",
        type: "Checking Account" as any,
        balance: 12560.75,
        currency: "USD",
        status: "Active" as any,
        createdAt: "2016-04-12T09:00:00Z"
      },
      {
        id: "ACC-0983",
        userId: alexUserId,
        accountNumber: "•••• •••• 0983",
        type: "Savings Account" as any,
        balance: 8250.30,
        currency: "USD",
        status: "Active" as any,
        createdAt: "2016-04-12T09:15:00Z"
      },
      {
        id: "ACC-1256",
        userId: alexUserId,
        accountNumber: "•••• •••• 1256",
        type: "Business Account" as any,
        balance: 15750.00,
        currency: "USD",
        status: "Active" as any,
        createdAt: "2017-05-10T11:00:00Z"
      },
      {
        id: "ACC-5678",
        userId: alexUserId,
        accountNumber: "•••• •••• 5678",
        type: "Fixed Deposit" as any,
        balance: 20000.00,
        currency: "USD",
        status: "Active" as any,
        createdAt: "2018-03-01T10:00:00Z"
      },
      {
        id: "ACC-8765",
        userId: alexUserId,
        accountNumber: "•••• •••• 8765",
        type: "Joint Account" as any,
        balance: 4850.40,
        currency: "USD",
        status: "Active" as any,
        createdAt: "2019-04-12T14:30:00Z"
      },
      {
        id: "ACC-4411",
        userId: sarahUserId,
        accountNumber: "•••• •••• 4411",
        type: "Checking Account" as any,
        balance: 18430.50,
        currency: "EUR",
        status: "Active" as any,
        createdAt: "2017-09-18T10:30:00Z"
      },
      {
        id: "ACC-2299",
        userId: sarahUserId,
        accountNumber: "•••• •••• 2299",
        type: "Savings Account" as any,
        balance: 24800.00,
        currency: "EUR",
        status: "Active" as any,
        createdAt: "2017-09-18T10:45:00Z"
      },
      {
        id: "ACC-7788",
        userId: sarahUserId,
        accountNumber: "•••• •••• 7788",
        type: "Business Account" as any,
        balance: 32000.00,
        currency: "EUR",
        status: "Active" as any,
        createdAt: "2018-10-15T09:00:00Z"
      },
      {
        id: "ACC-3311",
        userId: sarahUserId,
        accountNumber: "•••• •••• 3311",
        type: "Fixed Deposit" as any,
        balance: 15000.00,
        currency: "EUR",
        status: "Active" as any,
        createdAt: "2019-01-20T11:00:00Z"
      },
      {
        id: "ACC-9922",
        userId: sarahUserId,
        accountNumber: "•••• •••• 9922",
        type: "Joint Account" as any,
        balance: 3120.00,
        currency: "EUR",
        status: "Active" as any,
        createdAt: "2020-03-12T15:30:00Z"
      },
      {
        id: "ACC-6611",
        userId: marcusUserId,
        accountNumber: "•••• •••• 6611",
        type: "Checking Account" as any,
        balance: 34920.15,
        currency: "GBP",
        status: "Active" as any,
        createdAt: "2018-05-04T09:00:00Z"
      },
      {
        id: "ACC-1199",
        userId: marcusUserId,
        accountNumber: "•••• •••• 1199",
        type: "Savings Account" as any,
        balance: 122450.80,
        currency: "GBP",
        status: "Active" as any,
        createdAt: "2018-05-04T09:15:00Z"
      },
      {
        id: "ACC-5588",
        userId: marcusUserId,
        accountNumber: "•••• •••• 5588",
        type: "Business Account" as any,
        balance: 87400.00,
        currency: "GBP",
        status: "Active" as any,
        createdAt: "2019-06-12T10:00:00Z"
      },
      {
        id: "ACC-4488",
        userId: marcusUserId,
        accountNumber: "•••• •••• 4488",
        type: "Fixed Deposit" as any,
        balance: 50000.00,
        currency: "GBP",
        status: "Active" as any,
        createdAt: "2020-01-15T11:00:00Z"
      },
      {
        id: "ACC-2211",
        userId: marcusUserId,
        accountNumber: "•••• •••• 2211",
        type: "Joint Account" as any,
        balance: 7850.00,
        currency: "GBP",
        status: "Active" as any,
        createdAt: "2021-04-10T14:00:00Z"
      }
    ];

    const cards: BankCard[] = [
      {
        id: "CARD-1001",
        userId: alexUserId,
        accountId: "ACC-5521",
        cardNumber: "4000 1234 5678 4587",
        expiryDate: "09/29",
        cvv: "365",
        type: "Debit Card" as any,
        status: "Active" as any,
        dailyLimit: 5000,
        spentToday: 120.50,
        pin: "4321"
      },
      {
        id: "CARD-1002",
        userId: alexUserId,
        accountId: "ACC-5521",
        cardNumber: "4111 8888 9999 7890",
        expiryDate: "12/28",
        cvv: "782",
        type: "Credit Card" as any,
        status: "Active" as any,
        dailyLimit: 10000,
        spentToday: 2250.00,
        pin: "9876"
      },
      {
        id: "CARD-2001",
        userId: sarahUserId,
        accountId: "ACC-4411",
        cardNumber: "4000 9876 5432 1122",
        expiryDate: "08/30",
        cvv: "421",
        type: "Debit Card" as any,
        status: "Active" as any,
        dailyLimit: 6000,
        spentToday: 85.00,
        pin: "2468"
      },
      {
        id: "CARD-2002",
        userId: sarahUserId,
        accountId: "ACC-4411",
        cardNumber: "4111 7777 6666 5555",
        expiryDate: "11/29",
        cvv: "109",
        type: "Credit Card" as any,
        status: "Active" as any,
        dailyLimit: 15000,
        spentToday: 410.00,
        pin: "1357"
      },
      {
        id: "CARD-3001",
        userId: marcusUserId,
        accountId: "ACC-6611",
        cardNumber: "4000 1111 2222 3333",
        expiryDate: "05/31",
        cvv: "712",
        type: "Debit Card" as any,
        status: "Active" as any,
        dailyLimit: 10000,
        spentToday: 350.00,
        pin: "1212"
      },
      {
        id: "CARD-3002",
        userId: marcusUserId,
        accountId: "ACC-6611",
        cardNumber: "4111 9999 8888 7777",
        expiryDate: "10/30",
        cvv: "888",
        type: "Credit Card" as any,
        status: "Active" as any,
        dailyLimit: 25000,
        spentToday: 1850.00,
        pin: "0000"
      }
    ];

    const transactions: Transaction[] = [];
    const years = [2024, 2025, 2026];
    let txnIdCounter = 88200;

    const userConfigs = [
      {
        userId: alexUserId,
        checkingId: "ACC-5521",
        savingsId: "ACC-0983",
        businessId: "ACC-1256",
        salary: 3500.00,
        rent: -1450.00,
        company: "Stripe Technology Inc",
        rentTo: "Manhattan Residences"
      },
      {
        userId: sarahUserId,
        checkingId: "ACC-4411",
        savingsId: "ACC-2299",
        businessId: "ACC-7788",
        salary: 4800.00,
        rent: -1600.00,
        company: "Cyberdyne Defense Labs",
        rentTo: "Westside Living Inc."
      },
      {
        userId: marcusUserId,
        checkingId: "ACC-6611",
        savingsId: "ACC-1199",
        businessId: "ACC-5588",
        salary: 7500.00,
        rent: -2400.00,
        company: "Imperium Group Intl",
        rentTo: "Aurelius Estates LLC"
      }
    ];

    years.forEach(year => {
      for (let month = 1; month <= 12; month++) {
        if (year === 2026 && month > 6) continue;
        const dateStr = (day: number) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00Z`;

        userConfigs.forEach(cfg => {
          // Salary
          transactions.push({
            id: `TXN-${txnIdCounter++}`,
            userId: cfg.userId,
            accountId: cfg.checkingId,
            amount: cfg.salary,
            category: "Salary" as any,
            merchant: cfg.company,
            description: "Monthly Direct Deposit Salary",
            date: dateStr(1),
            status: "Completed" as any,
            referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`
          });

          // Rent
          transactions.push({
            id: `TXN-${txnIdCounter++}`,
            userId: cfg.userId,
            accountId: cfg.checkingId,
            amount: cfg.rent,
            category: "Utilities & Bills" as any,
            merchant: cfg.rentTo,
            description: "Monthly Rent Housing Transfer",
            date: dateStr(3),
            status: "Completed" as any,
            referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`
          });

          // Shopping
          transactions.push({
            id: `TXN-${txnIdCounter++}`,
            userId: cfg.userId,
            accountId: cfg.checkingId,
            amount: -85.50,
            category: "Shopping" as any,
            merchant: "Whole Foods Market",
            description: "Organic Groceries and Household",
            date: dateStr(15),
            status: "Completed" as any,
            referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`
          });
        });
      }
    });

    const beneficiaries: Beneficiary[] = [
      {
        id: "BEN-4001",
        userId: alexUserId,
        name: "Sarah Johnson",
        bankName: "Chase Bank",
        accountNumber: "•••• 9876"
      },
      {
        id: "BEN-4002",
        userId: alexUserId,
        name: "Marcus Aurelius",
        bankName: "Barclays Bank",
        accountNumber: "•••• 5522"
      }
    ];

    const loans: Loan[] = [
      {
        id: "LOAN-501",
        userId: alexUserId,
        type: "Mortgage Loan",
        amount: 250000,
        interestRate: 4.25,
        repaymentPeriod: 360,
        monthlyInstallment: 1229.85,
        status: "Approved" as any,
        appliedDate: "2020-05-10T08:00:00Z",
        approvedDate: "2020-05-15T12:00:00Z",
        documents: [
          { name: "Property Deed.pdf", url: "#" },
          { name: "Employment Proof.pdf", url: "#" }
        ]
      }
    ];

    const investments: InvestmentAsset[] = [
      {
        id: "INV-601",
        userId: alexUserId,
        type: "Stock" as any,
        name: "NVIDIA Corporation",
        symbol: "NVDA",
        quantity: 50,
        buyPrice: 420.50,
        currentPrice: 875.12,
        investedAmount: 21025.00,
        currentValue: 43756.00,
        lastUpdated: "2026-06-30T16:00:00Z"
      },
      {
        id: "INV-602",
        userId: alexUserId,
        type: "Stock" as any,
        name: "Apple Inc.",
        symbol: "AAPL",
        quantity: 80,
        buyPrice: 155.20,
        currentPrice: 172.62,
        investedAmount: 12416.00,
        currentValue: 13809.60,
        lastUpdated: "2026-06-30T16:00:00Z"
      }
    ];

    const tickets: SupportTicket[] = [
      {
        id: "TCK-801",
        userId: alexUserId,
        ticketNumber: "TCK-2026-9901",
        subject: "Disputed credit card charge",
        category: "Fraud Claim",
        status: "In Progress" as any,
        createdAt: "2026-06-25T14:30:00Z",
        messages: [
          {
            sender: "user",
            text: "Hi, I see a charge of $45.90 from 'Merchant Express' which I do not recognize. Can you please help verify?",
            timestamp: "2026-06-25T14:30:00Z"
          },
          {
            sender: "support",
            text: "Hello Alex, we have flagged this transaction and initiated a temporary hold. Our dispute team is currently researching. Please allow 3-5 business days.",
            timestamp: "2026-06-26T09:15:00Z"
          }
        ]
      }
    ];

    const notifications: UserNotification[] = [
      {
        id: "NOTIF-701",
        userId: alexUserId,
        title: "Salary Credited",
        message: "Your monthly salary of $3,500.00 from Stripe Technology Inc has been credited to Checking Account ACC-5521.",
        category: "Salary",
        date: "2026-06-01T12:05:00Z",
        isRead: false
      },
      {
        id: "NOTIF-702",
        userId: alexUserId,
        title: "Security Alert: New Login",
        message: "A new login was detected from a Chrome browser on a Linux device in New York, USA. If this wasn't you, lock your account immediately.",
        category: "Security",
        date: "2026-06-18T22:15:00Z",
        isRead: true
      }
    ];

    const securityLogs: SecurityLog[] = [
      {
        id: "LOG-901",
        userId: alexUserId,
        event: "Password Changed",
        device: "Safari / macOS High Sierra",
        location: "New York, USA",
        date: "2025-11-12T15:40:00Z",
        status: "Success"
      },
      {
        id: "LOG-902",
        userId: alexUserId,
        event: "Failed Transaction PIN Attempt",
        device: "ATM - Manhattan Branch 4",
        location: "New York, USA",
        date: "2026-02-14T18:10:00Z",
        status: "Failed"
      }
    ];

    const auditLogs: AuditLog[] = [
      {
        id: "AUD-301",
        adminUsername: "admin",
        action: "Approve Loan",
        details: "Approved Mortgage loan application LOAN-501 for user alexjohnson",
        date: "2020-05-15T12:00:00Z"
      }
    ];

    const branches: Branch[] = [
      {
        id: "BR-201",
        name: "Wall Street Headquarters",
        address: "120 Financial District, Wall St, New York, NY 10005",
        lat: 40.7060,
        lng: -74.0088,
        distance: "0.2 miles",
        phone: "+1 (212) 555-0100",
        hours: "Mon-Fri: 8:30 AM - 5:00 PM | Sat: 9:00 AM - 1:00 PM"
      },
      {
        id: "BR-202",
        name: "Midtown Platinum Branch",
        address: "450 Fifth Avenue, Midtown, New York, NY 10110",
        lat: 40.7527,
        lng: -73.9829,
        distance: "3.5 miles",
        phone: "+1 (212) 555-0199",
        hours: "Mon-Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 3:00 PM"
      }
    ];

    const employees: Employee[] = [
      {
        id: "EMP-101",
        name: "Sarah Jenkins",
        role: "Lead Wealth Manager",
        status: "Active",
        joinedDate: "2018-03-12"
      },
      {
        id: "EMP-102",
        name: "Robert Torres",
        role: "Senior Mortgage Advisor",
        status: "Active",
        joinedDate: "2019-07-22"
      }
    ];

    return {
      users,
      admins,
      accounts,
      cards,
      transactions,
      beneficiaries,
      loans,
      investments,
      tickets,
      notifications,
      securityLogs,
      auditLogs,
      branches,
      employees
    };
  }
}
