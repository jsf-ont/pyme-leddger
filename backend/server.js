require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'beanpcge-secret-key';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

const db = new Database(path.join(__dirname, 'data', 'beanpcge.db'));

db.pragma('journal_mode = WAL');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
  `);

  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
  if (accountCount.count === 0) {
    insertDefaultAccounts();
  }
}

function insertDefaultAccounts() {
  const defaultAccounts = [
    { code: '10', name: 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', type: 'asset', level: 1 },
    { code: '101', name: 'Caja', type: 'asset', level: 2 },
    { code: '1011', name: 'Caja Principal', type: 'asset', level: 3 },
    { code: '1012', name: 'Caja Chica', type: 'asset', level: 3 },
    { code: '12', name: 'CUENTAS POR COBRAR COMERCIALES - TERCEROS', type: 'asset', level: 1 },
    { code: '121', name: 'Facturas, Boletas y Otros Comprobantes por Cobrar', type: 'asset', level: 2 },
    { code: '1212', name: 'Emitidas', type: 'asset', level: 3 },
    { code: '20', name: 'MERCADERÍAS', type: 'asset', level: 1 },
    { code: '201', name: 'Mercaderías', type: 'asset', level: 2 },
    { code: '2011', name: 'Mercaderías Almacén', type: 'asset', level: 3 },
    { code: '40', name: 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', type: 'liability', level: 1 },
    { code: '401', name: 'Gobierno Central', type: 'liability', level: 2 },
    { code: '4011', name: 'IGV', type: 'liability', level: 3 },
    { code: '42', name: 'CUENTAS POR PAGAR COMERCIALES - TERCEROS', type: 'liability', level: 1 },
    { code: '421', name: 'Facturas, Boletas y Otros Comprobantes por Pagar', type: 'liability', level: 2 },
    { code: '4212', name: 'Emitidas', type: 'liability', level: 3 },
    { code: '50', name: 'CAPITAL', type: 'equity', level: 1 },
    { code: '501', name: 'Capital', type: 'equity', level: 2 },
    { code: '5011', name: 'Capital Suscrito y Pagado', type: 'equity', level: 3 },
    { code: '60', name: 'COMPRAS', type: 'expense', level: 1 },
    { code: '601', name: 'Mercaderías', type: 'expense', level: 2 },
    { code: '6011', name: 'Mercaderías Almacén', type: 'expense', level: 3 },
    { code: '62', name: 'GASTOS DE PERSONAL, DIRECTORES Y GERENTES', type: 'expense', level: 1 },
    { code: '621', name: 'Remuneraciones', type: 'expense', level: 2 },
    { code: '6211', name: 'Sueldos y Salarios', type: 'expense', level: 3 },
    { code: '63', name: 'GASTOS DE SERVICIOS PRESTADOS POR TERCEROS', type: 'expense', level: 1 },
    { code: '631', name: 'Alquileres', type: 'expense', level: 2 },
    { code: '6311', name: 'Alquiler de Oficina', type: 'expense', level: 3 },
    { code: '69', name: 'COSTO DE VENTAS', type: 'expense', level: 1 },
    { code: '691', name: 'Mercaderías', type: 'expense', level: 2 },
    { code: '6911', name: 'Mercaderías Almacén', type: 'expense', level: 3 },
    { code: '70', name: 'VENTAS', type: 'income', level: 1 },
    { code: '701', name: 'Mercaderías', type: 'income', level: 2 },
    { code: '7011', name: 'Mercaderías Almacén', type: 'income', level: 3 }
  ];

  const insert = db.prepare(`
    INSERT INTO accounts (id, company_id, code, name, type, level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((accounts) => {
    for (const acc of accounts) {
      insert.run(
        require('uuid').v4(),
        'default',
        acc.code,
        acc.name,
        acc.type,
        acc.level
      );
    }
  });

  insertMany(defaultAccounts);
}

initDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.db = db;
  next();
});

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    if (SUPABASE_JWT_SECRET) {
      const decoded = jwt.verify(token, SUPABASE_JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'https://your-project.supabase.co'
      });
      req.user = decoded;
      req.supabaseAuth = true;
    } else {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.supabaseAuth = false;
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`BeanPCGE Server running on port ${PORT}`);
});
