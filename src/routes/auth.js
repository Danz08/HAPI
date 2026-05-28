const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { redirectIfAuth } = require('../middleware/auth');

const router = express.Router();

// GET /auth/login
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('pages/login', {
    title: 'Login - HAPI',
    layout: 'layouts/main',
  });
});

// POST /auth/login
router.post('/login', redirectIfAuth, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email dan password harus diisi.');
    return res.redirect('/auth/login');
  }

  try {
    const db = getDb();
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/auth/login');
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/auth/login');
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name || user.username,
      is_onboarded: user.is_onboarded,
      login_method: 'manual',
    };
    req.session.isFirstLogin = true;

    req.flash('success', `Selamat datang kembali, ${user.display_name || user.username}! 👋`);
    if (!user.is_onboarded) {
      res.redirect('/onboarding');
    } else {
      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Terjadi kesalahan. Silakan coba lagi.');
    res.redirect('/auth/login');
  }
});

// GET /auth/register
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('pages/register', {
    title: 'Register - HAPI',
    layout: 'layouts/main',
  });
});

// POST /auth/register
router.post('/register', redirectIfAuth, async (req, res) => {
  const { username, email, password, confirm_password, display_name } = req.body;

  // Validation
  if (!username || !email || !password) {
    req.flash('error', 'Semua field harus diisi.');
    return res.redirect('/auth/register');
  }

  if (password.length < 6) {
    req.flash('error', 'Password minimal 6 karakter.');
    return res.redirect('/auth/register');
  }

  if (password !== confirm_password) {
    req.flash('error', 'Password dan konfirmasi password tidak cocok.');
    return res.redirect('/auth/register');
  }

  try {
    const db = getDb();

    // Check existing user
    const existing = await db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      req.flash('error', 'Email atau username sudah terdaftar.');
      return res.redirect('/auth/register');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const result = await db.prepare(
      'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?) RETURNING id'
    ).run(username, email, hashedPassword, display_name || username);

    // Log the user in
    req.session.user = {
      id: result.lastInsertRowid,
      username: username,
      email: email,
      display_name: display_name,
      is_onboarded: 0,
      login_method: 'manual',
    };

    req.flash('success', 'Akun berhasil dibuat! Silakan ikuti pengenalan fitur.');
    res.redirect('/onboarding');
  } catch (err) {
    console.error('Register error:', err);
    req.flash('error', 'Terjadi kesalahan. Silakan coba lagi.');
    res.redirect('/auth/register');
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/');
  });
});

module.exports = router;
