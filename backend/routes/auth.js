const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'beanpcge-secret-key-change-in-production';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, companyName, ruc } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }

    const db = req.db;
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email, hashedPassword, name);

    let company = null;
    if (companyName) {
      const companyId = uuidv4();
      db.prepare(`
        INSERT INTO companies (id, user_id, name, ruc)
        VALUES (?, ?, ?, ?)
      `).run(companyId, userId, companyName, ruc || null);

      company = {
        id: companyId,
        name: companyName,
        ruc: ruc || null
      };
    }

    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: userId, email, name },
      company
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const db = req.db;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      company
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.post('/demo', (req, res) => {
  try {
    const db = req.db;
    const userId = 'demo-user';
    const email = 'demo@beanpcge.pe';
    const name = 'Demo User';

    const company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(userId);

    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Demo mode activated',
      token,
      user: { id: userId, email, name },
      company: company || { id: 'demo-company', name: 'Empresa Demo', ruc: '20123456789' }
    });
  } catch (error) {
    console.error('Demo error:', error);
    res.status(500).json({ error: 'Error al iniciar modo demo' });
  }
});

router.get('/me', require('../middleware/auth'), (req, res) => {
  try {
    const db = req.db;
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(req.user.userId);

    res.json({ user, company });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});

router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, password } = req.body;
    const db = req.db;

    if (name) {
      db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, req.user.userId);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashedPassword, req.user.userId);
    }

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
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
        UPDATE companies SET name = COALESCE(?, name), ruc = COALESCE(?, ruc), 
        address = COALESCE(?, address), phone = COALESCE(?, phone),
        updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
      `).run(name, ruc, address, phone, req.user.userId);
    }

    const company = db.prepare('SELECT * FROM companies WHERE user_id = ?').get(req.user.userId);
    res.json({ company });
  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
});

module.exports = router;
