const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { redirectIfAuth } = require('../middleware/auth');

const router = express.Router();

const SESSION_VERSION = process.env.SESSION_VERSION || '1.0.0';

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
    req.flash('error', req.t('validation.missing_credentials', 'Email dan password harus diisi.'));
    return res.redirect('/auth/login');
  }

  try {
    const db = getDb();
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      req.flash('error', req.t('auth.invalid_credentials', 'Email atau password salah.'));
      return res.redirect('/auth/login');
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      req.flash('error', req.t('auth.invalid_credentials', 'Email atau password salah.'));
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
    req.session.version = SESSION_VERSION;
    req.session.isFirstLogin = true;

    // Welcome alert removed per request
    if (!user.is_onboarded) {
      res.redirect('/onboarding');
    } else {
      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', req.t('error.server_error', 'Terjadi kesalahan. Silakan coba lagi.'));
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
    req.flash('error', req.t('validation.all_fields_required', 'Semua field harus diisi.'));
    return res.redirect('/auth/register');
  }

  if (password.length < 6) {
    req.flash('error', req.t('validation.password_min_length', 'Password minimal 6 karakter.'));
    return res.redirect('/auth/register');
  }

  if (password !== confirm_password) {
    req.flash('error', req.t('validation.password_mismatch', 'Password dan konfirmasi password tidak cocok.'));
    return res.redirect('/auth/register');
  }

  try {
    const db = getDb();

    // Check existing user
    const existing = await db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      req.flash('error', req.t('auth.user_exists', 'Email atau username sudah terdaftar.'));
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
    req.session.version = SESSION_VERSION;

    // Welcome alert removed per request
    res.redirect('/onboarding');
  } catch (err) {
    console.error('Register error:', err);
    req.flash('error', req.t('error.server_error', 'Terjadi kesalahan. Silakan coba lagi.'));
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
