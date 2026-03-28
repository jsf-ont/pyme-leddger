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

router.put('/transactions/:id', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { date, description, reference, debitAccount, creditAccount, amount, currency, companyId } = req.body;
    const cid = companyId || req.user.userId;

    if (!date || !description || !debitAccount || !creditAccount || !amount) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const result = db.prepare(`
      UPDATE transactions 
      SET date = ?, description = ?, reference = ?, debit_account = ?, 
          credit_account = ?, amount = ?, currency = ?
      WHERE id = ? AND company_id = ?
    `).run(date, description, reference, debitAccount, creditAccount, amount, currency || 'PEN', id, cid);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
});

router.put('/accounts/:id', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { code, name, type, parentCode, active, companyId } = req.body;
    const cid = companyId || 'default';

    const existing = db.prepare('SELECT id FROM accounts WHERE id = ? AND (company_id = ? OR company_id = ?)').get(id, cid, 'default');
    if (!existing) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    db.prepare(`
      UPDATE accounts 
      SET code = COALESCE(?, code), name = COALESCE(?, name), 
          type = COALESCE(?, type), parent_code = COALESCE(?, parent_code),
          active = COALESCE(?, active)
      WHERE id = ?
    `).run(code, name, type, parentCode, active, id);

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
    res.json({ account });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Error al actualizar cuenta' });
  }
});

router.delete('/accounts/:id', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { companyId } = req.query;
    const cid = companyId || 'default';

    const account = db.prepare('SELECT id FROM accounts WHERE id = ? AND company_id = ?').get(id, cid);
    if (!account) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    db.prepare('DELETE FROM accounts WHERE id = ? AND company_id = ?').run(id, cid);
    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});

router.get('/dashboard/charts', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId } = req.query;
    const cid = companyId || req.user.userId;

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push(date.toISOString().slice(0, 7));
    }

    const monthlyData = last6Months.map(month => {
      const income = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
        WHERE company_id = ? AND credit_account LIKE '70%' AND date LIKE ?
      `).get(cid, month + '%');

      const expenses = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
        WHERE company_id = ? AND (debit_account LIKE '60%' OR debit_account LIKE '62%' OR debit_account LIKE '63%') AND date LIKE ?
      `).get(cid, month + '%');

      return {
        month,
        income: income.total,
        expenses: expenses.total,
      };
    });

    const accountTypes = db.prepare(`
      SELECT type, COUNT(*) as count FROM accounts 
      WHERE company_id = ? OR company_id = 'default'
      GROUP BY type
    `).all(cid);

    res.json({ monthlyData, accountTypes });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ error: 'Error al obtener gráficos' });
  }
});

router.get('/dashboard/recent', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId, limit = 10 } = req.query;
    const cid = companyId || req.user.userId;

    const recentTransactions = db.prepare(`
      SELECT t.*, 
        da.name as debit_account_name, ca.name as credit_account_name
      FROM transactions t
      LEFT JOIN accounts da ON da.code = t.debit_account
      LEFT JOIN accounts ca ON ca.code = t.credit_account
      WHERE t.company_id = ? 
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?
    `).all(cid, parseInt(limit) || 10);

    res.json({ recentTransactions });
  } catch (error) {
    console.error('Dashboard recent error:', error);
    res.status(500).json({ error: 'Error al obtener transacciones recientes' });
  }
});

router.get('/reports/sunat', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const { companyId, year, month } = req.query;
    const cid = companyId || req.user.userId;
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const purchases = db.prepare(`
      SELECT t.*, a.name as account_name
      FROM transactions t
      JOIN accounts a ON a.code = t.debit_account
      WHERE t.company_id = ? AND t.date LIKE ? AND a.code LIKE '60%'
      ORDER BY t.date
    `).all(cid, targetMonth + '%');

    const sales = db.prepare(`
      SELECT t.*, a.name as account_name
      FROM transactions t
      JOIN accounts a ON a.code = t.credit_account
      WHERE t.company_id = ? AND t.date LIKE ? AND a.code LIKE '70%'
      ORDER BY t.date
    `).all(cid, targetMonth + '%');

    const igr = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE company_id = ? AND credit_account LIKE '4011%' AND date LIKE ?
    `).get(cid, targetMonth + '%');

    const igvPaid = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE company_id = ? AND debit_account LIKE '4011%' AND date LIKE ?
    `).get(cid, targetMonth + '%');

    res.json({
      period: { year: targetYear, month: targetMonth },
      purchases,
      sales,
      igr: igr.total,
      igvPaid: igvPaid.total,
      netIgv: igr.total - igvPaid.total,
    });
  } catch (error) {
    console.error('SUNAT report error:', error);
    res.status(500).json({ error: 'Error al generar reporte SUNAT' });
  }
});

router.get('/company', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(req.user.userId);
    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Error al obtener empresa' });
  }
});

router.put('/company', require('../middleware/auth'), (req, res) => {
  try {
    const { name, ruc, address, phone } = req.body;
    const db = req.db;

    const existing = db.prepare('SELECT id FROM companies WHERE user_id = ?').get(req.user.userId);

    if (!existing) {
      const companyId = uuidv4();
      db.prepare(`
        INSERT INTO companies (id, user_id, name, ruc, address, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(companyId, req.user.userId, name, ruc, address, phone);
    } else {
      db.prepare(`
        UPDATE companies SET 
          name = COALESCE(?, name), 
          ruc = COALESCE(?, ruc), 
          address = COALESCE(?, address), 
          phone = COALESCE(?, phone),
          updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?
      `).run(name, ruc, address, phone, req.user.userId);
    }

    const company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(req.user.userId);
    res.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
});

module.exports = router;
