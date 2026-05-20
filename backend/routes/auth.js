const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/register  (patients only)
router.post('/register', async (req, res) => {
  const { name, email, password, phone, date_of_birth, blood_type } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  try {
    console.log('📝 Registration attempt for:', email);
    const existing = await db.get_('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      console.log('⚠️ Email already exists:', email);
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const hashed = bcrypt.hashSync(password, 10);
    console.log('🔐 Password hashed, inserting user...');
    const result = await db.run_(
      `INSERT INTO users (name, email, password, phone, date_of_birth, blood_type) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashed, phone || null, date_of_birth || null, blood_type || null]
    );
    console.log('✅ User created with ID:', result.lastInsertRowid);
    const token = jwt.sign({ id: result.lastInsertRowid, email, name, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Account created!', token, user: { id: result.lastInsertRowid, name, email, role: 'patient' } });
  } catch (err) {
    console.error('❌ Registration error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// POST /api/auth/login  (patients + admins — checks users table)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  try {
    console.log('🔑 Login attempt for:', email);
    const user = await db.get_('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    console.log('✅ Login successful for:', email);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful!', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('❌ Login error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// POST /api/auth/doctor-login  (doctors only — checks doctors table)
router.post('/doctor-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  try {
    console.log('🏥 Doctor login attempt for:', email);
    const doctor = await db.get_('SELECT * FROM doctors WHERE email = ?', [email]);
    if (!doctor) {
      console.log('❌ Doctor not found:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!bcrypt.compareSync(password, doctor.password)) {
      console.log('❌ Password mismatch for doctor:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    console.log('✅ Doctor login successful for:', email);
    const token = jwt.sign({ id: doctor.id, email: doctor.email, name: doctor.name, role: 'doctor', department: doctor.department }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful!', token,
      user: { id: doctor.id, name: doctor.name, email: doctor.email, role: 'doctor', department: doctor.department }
    });
  } catch (err) {
    console.error('❌ Doctor login error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});
    const token = jwt.sign({ id: doctor.id, email: doctor.email, name: doctor.name, role: 'doctor', department: doctor.department }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful!', token,
      user: { id: doctor.id, name: doctor.name, email: doctor.email, role: 'doctor', department: doctor.department }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const doc = await db.get_('SELECT id, name, email, phone, department, specialization, created_at FROM doctors WHERE id = ?', [req.user.id]);
      return res.json({ ...doc, role: 'doctor' });
    }
    const user = await db.get_('SELECT id, name, email, role, phone, date_of_birth, blood_type, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
