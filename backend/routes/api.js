const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/accounts', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const companyId = req.query.companyId || 'default';
    
    const accounts = db.prepare(`
      SELECT * FROM accounts 
      WHERE company_id = ? OR company_id = 'default'
      ORDER BY code
    `).all(companyId);

    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

router.post('/accounts', require('../middleware/auth'), (req, res) => {
  try {
    const { code, name, type, parentCode, companyId } = req.body;
    const db = req.db;
    const cid = companyId || 'default';

    const existing = db.prepare('SELECT id FROM accounts WHERE code = ? AND company_id = ?').get(code, cid);

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta con este código' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO accounts (id, company_id, code, name, type, parent_code, level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, cid, code, name, type, parentCode || null, parentCode ? 2 : 1);

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
    res.json({ account });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Error al crear cuenta' });
  }
});

router.get('/transactions', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId, startDate, endDate, limit = 50, offset = 0 } = req.query;
    const cid = companyId || req.user.userId;

    let query = 'SELECT * FROM transactions WHERE company_id = ?';
    const params = [cid];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = db.prepare(query).all(...params);

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

router.post('/transactions', require('../middleware/auth'), (req, res) => {
  try {
    const { date, description, reference, debitAccount, creditAccount, amount, currency, companyId } = req.body;
    const db = req.db;
    const cid = companyId || req.user.userId;

    if (!date || !description || !debitAccount || !creditAccount || !amount) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO transactions (id, company_id, date, description, reference, debit_account, credit_account, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cid, date, description, reference, debitAccount, creditAccount, amount, currency || 'PEN');

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json({ transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

router.get('/dashboard', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId } = req.query;
    const cid = companyId || req.user.userId;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const totalIncome = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE company_id = ? AND credit_account LIKE '70%' AND date LIKE ?
    `).get(cid, currentMonth + '%');

    const totalExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE company_id = ? AND debit_account LIKE '60%' OR debit_account LIKE '62%' OR debit_account LIKE '63%' AND date LIKE ?
    `).get(cid, currentMonth + '%');

    const accountsReceivable = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE company_id = ? AND credit_account LIKE '12%'
    `).get(cid);

    const accountsPayable = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE company_id = ? AND debit_account LIKE '42%'
    `).get(cid);

    const recentTransactions = db.prepare(`
      SELECT * FROM transactions WHERE company_id = ? 
      ORDER BY date DESC, created_at DESC LIMIT 10
    `).all(cid);

    res.json({
      summary: {
        income: totalIncome.total,
        expenses: totalExpenses.total,
        profit: totalIncome.total - totalExpenses.total,
        accountsReceivable: accountsReceivable.total,
        accountsPayable: accountsPayable.total
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
});

router.get('/reports/balance', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId } = req.query;
    const cid = companyId || req.user.userId;

    const assets = db.prepare(`
      SELECT code, name, 
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.debit_account LIKE a.code || '%') -
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.credit_account LIKE a.code || '%') as balance
      FROM accounts a WHERE a.type = 'asset' AND (a.company_id = ? OR a.company_id = 'default')
      ORDER BY a.code
    `).all(cid, cid, cid);

    const liabilities = db.prepare(`
      SELECT code, name, 
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.credit_account LIKE a.code || '%') -
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.debit_account LIKE a.code || '%') as balance
      FROM accounts a WHERE a.type = 'liability' AND (a.company_id = ? OR a.company_id = 'default')
      ORDER BY a.code
    `).all(cid, cid, cid);

    const equity = db.prepare(`
      SELECT code, name, 
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.credit_account LIKE a.code || '%') -
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.debit_account LIKE a.code || '%') as balance
      FROM accounts a WHERE a.type = 'equity' AND (a.company_id = ? OR a.company_id = 'default')
      ORDER BY a.code
    `).all(cid, cid, cid);

    const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.balance || 0), 0);
    const totalEquity = equity.reduce((sum, e) => sum + (e.balance || 0), 0);

    res.json({
      assets: assets.filter(a => a.balance > 0),
      liabilities: liabilities.filter(l => l.balance > 0),
      equity: equity.filter(e => e.balance > 0),
      totals: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        check: totalAssets - (totalLiabilities + totalEquity)
      }
    });
  } catch (error) {
    console.error('Balance report error:', error);
    res.status(500).json({ error: 'Error al generar balance' });
  }
});

router.get('/reports/income', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId, month } = req.query;
    const cid = companyId || req.user.userId;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const income = db.prepare(`
      SELECT code, name, 
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.credit_account LIKE a.code || '%' AND t.date LIKE ?) as balance
      FROM accounts a WHERE a.type = 'income' AND (a.company_id = ? OR a.company_id = 'default')
      ORDER BY a.code
    `).all(cid, targetMonth + '%', cid);

    const expenses = db.prepare(`
      SELECT code, name, 
        (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
         WHERE t.company_id = ? AND t.debit_account LIKE a.code || '%' AND t.date LIKE ?) as balance
      FROM accounts a WHERE a.type = 'expense' AND (a.company_id = ? OR a.company_id = 'default')
      ORDER BY a.code
    `).all(cid, targetMonth + '%', cid);

    const totalIncome = income.reduce((sum, i) => sum + (i.balance || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.balance || 0), 0);

    res.json({
      income: income.filter(i => i.balance > 0),
      expenses: expenses.filter(e => e.balance > 0),
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        profit: totalIncome - totalExpenses
      }
    });
  } catch (error) {
    console.error('Income report error:', error);
    res.status(500).json({ error: 'Error al generar estado de resultados' });
  }
});

router.delete('/transactions/:id', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { companyId } = req.query;
    const cid = companyId || req.user.userId;

    const result = db.prepare('DELETE FROM transactions WHERE id = ? AND company_id = ?').run(id, cid);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json({ message: 'Transacción eliminada exitosamente' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
});

module.exports = router;
