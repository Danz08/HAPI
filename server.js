require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const { initDatabase } = require('./src/config/database');

// Route imports
const indexRoutes = require('./src/routes/index');
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const quizRoutes = require('./src/routes/quiz');
const pomodoroRoutes = require('./src/routes/pomodoro');
const analyticsRoutes = require('./src/routes/analytics');
const apiRoutes = require('./src/routes/api');
const googleAuthRoutes = require('./src/routes/google-auth');

const app = express();
const PORT = process.env.PORT || 3000;

initDatabase();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'hapi-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(flash());

// Global template vars
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/quiz', quizRoutes);
app.use('/pomodoro', pomodoroRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/api', apiRoutes);
app.use('/auth/google', googleAuthRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Halaman Tidak Ditemukan',
    message: 'Halaman yang kamu cari tidak ditemukan.',
    layout: 'layouts/main',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 - Terjadi Kesalahan',
    message: 'Maaf, terjadi kesalahan pada server.',
    layout: 'layouts/main',
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   HAPI - Human Activity Pattern Intelligence  ║
  ║                                               ║
  ║   Server running on http://localhost:${PORT}      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
