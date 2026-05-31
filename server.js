require('dotenv').config();

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const { initDatabase, pool } = require('./src/config/database');

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

initDatabase().catch(err => {
  console.error('❌ Failed to initialize PostgreSQL database:', err);
  process.exit(1);
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'hapi-default-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 20 * 60 * 60 * 1000 // 20 hours
  },
}));

// Timezone extraction middleware
app.use((req, res, next) => {
  let tz = 'Asia/Jakarta'; // Fallback
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)hapi_tz=([^;]+)/);
    if (match) {
      try { tz = decodeURIComponent(match[1]); } catch (e) {}
    }
  }
  req.userTz = tz;
  res.locals.userTz = tz;
  next();
});

app.use(flash());

// Global template vars
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.currentPath = req.path;

  // Check if mood already logged today (for navbar mood button)
  res.locals.moodLoggedToday = false;
  if (req.session.user) {
    try {
      const db = require('./src/config/database').getDb();
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: req.userTz }).format(new Date());
      const existingMood = await db.prepare(
        'SELECT id FROM mood_logs WHERE user_id = ? AND date = ? LIMIT 1'
      ).get(req.session.user.id, today);
      res.locals.moodLoggedToday = !!existingMood;
    } catch (e) {
      // Silently fail - don't block page load
    }
  }

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

if (require.main === module) {
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
}

module.exports = app;
