import pg from "pg";
import bcrypt from "bcryptjs";
import { AsyncLocalStorage } from "async_hooks";
import { AuroraDB } from "./mockDb";

const { Pool } = pg;

// Use the environment variable DATABASE_URL for Render PostgreSQL
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/aurora";

export const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1")
    ? { rejectUnauthorized: false }
    : false
});

// Use AsyncLocalStorage to keep track of PostgreSQL clients for transactional safety
const transactionStorage = new AsyncLocalStorage<pg.PoolClient>();

// Helper to translate SQLite question-mark placeholders (?) to PostgreSQL positional placeholders ($1, $2, etc.)
export function translateSql(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Transaction runner that ensures all sequential queries run on the same PostgreSQL client
export function runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
  return pool.connect().then(async (client) => {
    try {
      await client.query("BEGIN;");
      const result = await transactionStorage.run(client, callback);
      await client.query("COMMIT;");
      return result;
    } catch (err) {
      try {
        await client.query("ROLLBACK;");
      } catch (rollbackErr) {
        console.error("Rollback failed", rollbackErr);
      }
      throw err;
    } finally {
      client.release();
    }
  });
}

// Executes an INSERT, UPDATE, or DELETE query
export async function run(sql: string, params: any[] = []): Promise<any> {
  const sqlTrimmed = sql.trim().toUpperCase();
  if (sqlTrimmed.startsWith("PRAGMA")) {
    return { lastID: null, changes: 0 };
  }
  if (sqlTrimmed === "BEGIN TRANSACTION;" || sqlTrimmed === "BEGIN;" || sqlTrimmed === "COMMIT;" || sqlTrimmed === "ROLLBACK;") {
    // These are handled by runInTransaction and can be safely ignored here
    return { lastID: null, changes: 0 };
  }

  const query = translateSql(sql);
  const executor = transactionStorage.getStore() || pool;
  const res = await executor.query(query, params);
  return { lastID: null, changes: res.rowCount };
}

const camelCaseMap: Record<string, string> = {
  firstname: "firstName",
  lastname: "lastName",
  fullname: "fullName",
  profilepic: "profilePic",
  joinedat: "joinedAt",
  apppin: "appPin",
  transactionpin: "transactionPin",
  biometricsenabled: "biometricsEnabled",
  securityquestion: "securityQuestion",
  securityanswer: "securityAnswer",
  nextofkin: "nextOfKin",
  preferredcurrency: "preferredCurrency",
  accountnumber: "accountNumber",
  createdat: "createdAt",
  userid: "userId",
  accountid: "accountId",
  cardnumber: "cardNumber",
  expirydate: "expiryDate",
  dailylimit: "dailyLimit",
  spenttoday: "spentToday",
  isdefault: "isDefault",
  referencenumber: "referenceNumber",
  bankname: "bankName",
  interestrate: "interestRate",
  repaymentperiod: "repaymentPeriod",
  monthlyinstallment: "monthlyInstallment",
  applieddate: "appliedDate",
  approveddate: "approvedDate",
  buyprice: "buyPrice",
  currentprice: "currentPrice",
  investedamount: "investedAmount",
  currentvalue: "currentValue",
  lastupdated: "lastUpdated",
  isread: "isRead",
  ticketnumber: "ticketNumber",
  adminusername: "adminUsername",
  joineddate: "joinedDate"
};

function mapRowKeys(row: any): any {
  if (!row || typeof row !== "object") return row;
  const newRow: any = {};
  for (const key of Object.keys(row)) {
    const camelKey = camelCaseMap[key] || key;
    newRow[camelKey] = row[key];
  }
  return newRow;
}

// Executes a query returning multiple rows
export async function all(sql: string, params: any[] = []): Promise<any[]> {
  const query = translateSql(sql);
  const executor = transactionStorage.getStore() || pool;
  const res = await executor.query(query, params);
  return res.rows.map(mapRowKeys);
}

// Executes a query returning a single row
export async function get(sql: string, params: any[] = []): Promise<any> {
  const query = translateSql(sql);
  const executor = transactionStorage.getStore() || pool;
  const res = await executor.query(query, params);
  return res.rows[0] ? mapRowKeys(res.rows[0]) : null;
}

// Initializes the PostgreSQL tables, indexes, and seeds initial data only once if empty
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN;");

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        profilePic TEXT,
        joinedAt TEXT,
        status TEXT,
        password TEXT,
        appPin TEXT,
        transactionPin TEXT,
        biometricsEnabled TEXT,
        securityQuestion TEXT,
        securityAnswer TEXT,
        address TEXT,
        dob TEXT,
        employment TEXT,
        nextOfKin TEXT,
        preferredCurrency TEXT
      );
    `);

    // 2. Create Admins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        fullName TEXT,
        role TEXT,
        password TEXT
      );
    `);

    // 3. Create Accounts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        userId TEXT,
        accountNumber TEXT,
        type TEXT,
        balance REAL,
        currency TEXT,
        status TEXT,
        createdAt TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 4. Create Cards Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        userId TEXT,
        accountId TEXT,
        cardNumber TEXT,
        expiryDate TEXT,
        cvv TEXT,
        type TEXT,
        status TEXT,
        dailyLimit REAL,
        spentToday REAL,
        pin TEXT,
        isDefault INTEGER DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(accountId) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    // Ensure the isDefault column exists
    await client.query(`
      ALTER TABLE cards ADD COLUMN IF NOT EXISTS isDefault INTEGER DEFAULT 0;
    `);

    // 5. Create Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        accountId TEXT,
        amount REAL,
        category TEXT,
        merchant TEXT,
        description TEXT,
        date TEXT,
        status TEXT,
        referenceNumber TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(accountId) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    // 6. Create Beneficiaries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id TEXT PRIMARY KEY,
        userId TEXT,
        name TEXT,
        bankName TEXT,
        accountNumber TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 7. Create Loans Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        amount REAL,
        interestRate REAL,
        repaymentPeriod INTEGER,
        monthlyInstallment REAL,
        status TEXT,
        appliedDate TEXT,
        approvedDate TEXT,
        documents TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 8. Create Investments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        name TEXT,
        symbol TEXT,
        quantity REAL,
        buyPrice REAL,
        currentPrice REAL,
        investedAmount REAL,
        currentValue REAL,
        lastUpdated TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 9. Create Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        message TEXT,
        category TEXT,
        date TEXT,
        isRead INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 10. Create Support Tickets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        userId TEXT,
        ticketNumber TEXT,
        subject TEXT,
        category TEXT,
        status TEXT,
        createdAt TEXT,
        messages TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 11. Create Security Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS securityLogs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        event TEXT,
        device TEXT,
        location TEXT,
        date TEXT,
        status TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 12. Create Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS auditLogs (
        id TEXT PRIMARY KEY,
        adminUsername TEXT,
        action TEXT,
        details TEXT,
        date TEXT
      );
    `);

    // 13. Create Branches Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        lat REAL,
        lng REAL,
        distance TEXT,
        phone TEXT,
        hours TEXT
      );
    `);

    // 14. Create Employees Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        status TEXT,
        joinedDate TEXT
      );
    `);

    // Create Indexes for high performance lookup
    await client.query(`CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(userId);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(userId);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(userId);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(userId);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);`);

    // Check if the database is empty and seed only once
    const userCheck = await client.query("SELECT COUNT(*) as count FROM users;");
    const count = parseInt(userCheck.rows[0].count, 10);

    if (count === 0) {
      console.log("Database is empty. Seeding rich initial data to PostgreSQL...");
      const seed = AuroraDB.generateSeedData();

      // Seed Users
      for (const u of seed.users) {
        const hashedPassword = bcrypt.hashSync("Password123", 10);
        await client.query(`
          INSERT INTO users (
            id, username, firstName, lastName, email, phone, profilePic, joinedAt, status, password,
            appPin, transactionPin, biometricsEnabled, securityQuestion, securityAnswer, address, dob,
            employment, nextOfKin, preferredCurrency
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        `, [
          u.id, u.username, u.firstName, u.lastName, u.email, u.phone, u.profilePic, u.joinedAt, u.status, hashedPassword,
          u.appPin, u.transactionPin, JSON.stringify(u.biometricsEnabled), u.securityQuestion, u.securityAnswer,
          u.address, u.dob || null, u.employment || null, u.nextOfKin || null, u.preferredCurrency || "USD"
        ]);
      }

      // Seed Admins
      for (const a of seed.admins) {
        const hashedPassword = bcrypt.hashSync("AdminPassword", 10);
        await client.query(`
          INSERT INTO admins (username, fullName, role, password)
          VALUES ($1, $2, $3, $4)
        `, [a.username, a.fullName, a.role, hashedPassword]);
      }

      // Seed Accounts
      for (const acc of seed.accounts) {
        await client.query(`
          INSERT INTO accounts (id, userId, accountNumber, type, balance, currency, status, createdAt)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [acc.id, acc.userId, acc.accountNumber, acc.type, acc.balance, acc.currency, acc.status, acc.createdAt]);
      }

      // Seed Cards
      for (const card of seed.cards) {
        await client.query(`
          INSERT INTO cards (id, userId, accountId, cardNumber, expiryDate, cvv, type, status, dailyLimit, spentToday, pin, isDefault)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [card.id, card.userId, card.accountId, card.cardNumber, card.expiryDate, card.cvv, card.type, card.status, card.dailyLimit, card.spentToday, card.pin, card.isDefault ? 1 : 0]);
      }

      // Seed Transactions
      console.log(`Seeding ${seed.transactions.length} historic transactions...`);
      for (const tx of seed.transactions) {
        await client.query(`
          INSERT INTO transactions (id, userId, accountId, amount, category, merchant, description, date, status, referenceNumber)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [tx.id, tx.userId, tx.accountId, tx.amount, tx.category, tx.merchant, tx.description, tx.date, tx.status, tx.referenceNumber]);
      }

      // Seed Beneficiaries
      for (const b of seed.beneficiaries) {
        await client.query(`
          INSERT INTO beneficiaries (id, userId, name, bankName, accountNumber)
          VALUES ($1, $2, $3, $4, $5)
        `, [b.id, b.userId, b.name, b.bankName, b.accountNumber]);
      }

      // Seed Loans
      for (const l of seed.loans) {
        await client.query(`
          INSERT INTO loans (id, userId, type, amount, interestRate, repaymentPeriod, monthlyInstallment, status, appliedDate, approvedDate, documents)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [l.id, l.userId, l.type, l.amount, l.interestRate, l.repaymentPeriod, l.monthlyInstallment, l.status, l.appliedDate, l.approvedDate || null, JSON.stringify(l.documents || [])]);
      }

      // Seed Investments
      for (const i of seed.investments) {
        await client.query(`
          INSERT INTO investments (id, userId, type, name, symbol, quantity, buyPrice, currentPrice, investedAmount, currentValue, lastUpdated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [i.id, i.userId, i.type, i.name, i.symbol, i.quantity, i.buyPrice, i.currentPrice, i.investedAmount, i.currentValue, i.lastUpdated]);
      }

      // Seed Notifications
      for (const n of seed.notifications) {
        await client.query(`
          INSERT INTO notifications (id, userId, title, message, category, date, isRead)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [n.id, n.userId, n.title, n.message, n.category, n.date, n.isRead ? 1 : 0]);
      }

      // Seed Tickets
      for (const t of seed.tickets) {
        await client.query(`
          INSERT INTO tickets (id, userId, ticketNumber, subject, category, status, createdAt, messages)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [t.id, t.userId, t.ticketNumber, t.subject, t.category, t.status, t.createdAt, JSON.stringify(t.messages || [])]);
      }

      // Seed Security Logs
      for (const sl of seed.securityLogs) {
        await client.query(`
          INSERT INTO securityLogs (id, userId, event, device, location, date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [sl.id, sl.userId, sl.event, sl.device, sl.location, sl.date, sl.status]);
      }

      // Seed Audit Logs
      for (const al of seed.auditLogs) {
        await client.query(`
          INSERT INTO auditLogs (id, adminUsername, action, details, date)
          VALUES ($1, $2, $3, $4, $5)
        `, [al.id, al.adminUsername, al.action, al.details, al.date]);
      }

      // Seed Branches
      for (const br of seed.branches) {
        await client.query(`
          INSERT INTO branches (id, name, address, lat, lng, distance, phone, hours)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [br.id, br.name, br.address, br.lat, br.lng, br.distance, br.phone, br.hours]);
      }

      // Seed Employees
      for (const emp of seed.employees) {
        await client.query(`
          INSERT INTO employees (id, name, role, status, joinedDate)
          VALUES ($1, $2, $3, $4, $5)
        `, [emp.id, emp.name, emp.role, emp.status, emp.joinedDate]);
      }

      console.log("Database seeded successfully with all 14 tables in PostgreSQL!");
    }

    await client.query("COMMIT;");
  } catch (err) {
    try {
      await client.query("ROLLBACK;");
    } catch (rbErr) {
      console.error("Initialization rollback failed", rbErr);
    }
    console.error("Failed to initialize PostgreSQL tables or seed data", err);
    throw err;
  } finally {
    client.release();
  }
}
