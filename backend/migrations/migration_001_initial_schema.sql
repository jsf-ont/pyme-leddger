-- Migration 001: Initial Schema
-- BeanPCGE - Contabilidad para MYPEs Peruanas
-- Created: 2024

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ruc TEXT,
  address TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PCGE Accounts table (Plan Contable General Empresarial)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_code TEXT,
  level INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (Asientos contables)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'PEN',
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_company ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id);
