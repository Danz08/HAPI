const express = require('express');
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { extractCalendarFeatures, calculateCalendarBurnoutScore } = require('../utils/calendar');

const router = express.Router();

/**
 * Create OAuth2 client
 */
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
  );
}

// GET /auth/google - Start OAuth2 flow (works for both login and connect)
router.get('/', (req, res) => {
  const oauth2Client = getOAuth2Client();

  // If user is logged in, this is a "connect calendar" flow
  // If not logged in, this is a "login with Google" flow
  const isConnect = req.session.user ? 'connect' : 'login';

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state: isConnect,
  });

  res.redirect(authUrl);
});

// GET /auth/google/callback - Handle OAuth2 callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const flowType = req.query.state || 'login'; // 'login' or 'connect'

  if (!code) {
    req.flash('error', 'Autentikasi Google dibatalkan.');
    return res.redirect(flowType === 'connect' ? '/analytics' : '/auth/login');
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get Google user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    const db = getDb();

    if (flowType === 'connect' && req.session.user) {
      // === CONNECT flow: link calendar to existing account ===
      const userId = req.session.user.id;

      db.prepare(`
        UPDATE users SET
          google_refresh_token = ?,
          google_access_token = ?,
          google_token_expiry = ?,
          google_connected = 1
        WHERE id = ?
      `).run(
        tokens.refresh_token || null,
        tokens.access_token || null,
        tokens.expiry_date || null,
        userId
      );

      try {
        await syncCalendarEvents(oauth2Client, userId);
        req.flash('success', 'Google Calendar berhasil terhubung dan data tersinkronisasi! 📅');
      } catch (syncErr) {
        console.error('Calendar sync error:', syncErr);
        req.flash('success', 'Google Calendar terhubung!');
      }

      return res.redirect('/analytics');
    }

    // === LOGIN flow: create/find account from Google profile ===
    const email = googleUser.email;
    const displayName = googleUser.name || email.split('@')[0];
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Register new user
      const dummyPassword = bcrypt.hashSync(require('crypto').randomBytes(32).toString('hex'), 10);
      const result = db.prepare(
        'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)'
      ).run(username, email, dummyPassword, displayName);

      user = { id: result.lastInsertRowid, username, email, display_name: displayName };
    }

    // Save Google tokens
    db.prepare(`
      UPDATE users SET
        google_refresh_token = COALESCE(?, google_refresh_token),
        google_access_token = ?,
        google_token_expiry = ?,
        google_connected = 1
      WHERE id = ?
    `).run(
      tokens.refresh_token || null,
      tokens.access_token || null,
      tokens.expiry_date || null,
      user.id
    );

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name || user.username,
    };

    // Sync calendar
    try {
      await syncCalendarEvents(oauth2Client, user.id);
    } catch (syncErr) {
      console.error('Calendar sync error:', syncErr);
    }

    req.flash('success', `Selamat datang, ${user.display_name || user.username}! Google Calendar tersinkronisasi 📅`);
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Google OAuth error:', err);
    req.flash('error', 'Gagal menghubungkan Google. Silakan coba lagi.');
    return res.redirect(flowType === 'connect' ? '/analytics' : '/auth/login');
  }
});

// GET /auth/google/disconnect - Disconnect Google Calendar
router.get('/disconnect', requireAuth, (req, res) => {
  const db = getDb();

  db.prepare(`
    UPDATE users SET
      google_refresh_token = NULL,
      google_access_token = NULL,
      google_token_expiry = NULL,
      google_connected = 0
    WHERE id = ?
  `).run(req.session.user.id);

  db.prepare('DELETE FROM calendar_events WHERE user_id = ?').run(req.session.user.id);
  db.prepare('DELETE FROM calendar_features WHERE user_id = ?').run(req.session.user.id);

  req.flash('success', 'Google Calendar berhasil diputuskan.');
  res.redirect('/analytics');
});

// POST /auth/google/sync - Manual sync
router.post('/sync', requireAuth, async (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const user = db.prepare('SELECT google_refresh_token, google_access_token, google_token_expiry FROM users WHERE id = ?').get(userId);

  if (!user || !user.google_refresh_token) {
    return res.status(400).json({ error: 'Google Calendar belum terhubung.' });
  }

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: user.google_refresh_token,
      access_token: user.google_access_token,
      expiry_date: user.google_token_expiry,
    });

    oauth2Client.on('tokens', (newTokens) => {
      const updates = {};
      if (newTokens.access_token) updates.google_access_token = newTokens.access_token;
      if (newTokens.expiry_date) updates.google_token_expiry = newTokens.expiry_date;
      if (newTokens.refresh_token) updates.google_refresh_token = newTokens.refresh_token;

      const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      if (sets) {
        db.prepare(`UPDATE users SET ${sets} WHERE id = ?`).run(...Object.values(updates), userId);
      }
    });

    const days = parseInt(req.body.days) || 30;
    await syncCalendarEvents(oauth2Client, userId, days);

    res.json({ success: true, message: 'Kalender berhasil disinkronisasi.' });
  } catch (err) {
    console.error('Calendar sync error:', err);
    res.status(500).json({ error: 'Gagal menyinkronisasi kalender.' });
  }
});

/**
 * Sync calendar events for a user
 */
async function syncCalendarEvents(oauth2Client, userId, days = 30) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const db = getDb();

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Sync future events too (rest of current month + next month)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  endDate.setHours(23, 59, 59, 999);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 2500,
  });

  const events = response.data.items || [];

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  db.prepare('DELETE FROM calendar_events WHERE user_id = ? AND date BETWEEN ? AND ?')
    .run(userId, startStr, endStr);
  db.prepare('DELETE FROM calendar_features WHERE user_id = ? AND date BETWEEN ? AND ?')
    .run(userId, startStr, endStr);

  const eventsByDate = {};
  for (const ev of events) {
    const evStart = ev.start.dateTime || ev.start.date;
    const dateStr = evStart.substring(0, 10);

    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(ev);

    db.prepare(`
      INSERT OR REPLACE INTO calendar_events (user_id, event_id, title, start_time, end_time, date, event_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      ev.id,
      ev.summary || '(Tanpa judul)',
      ev.start.dateTime || ev.start.date,
      ev.end.dateTime || ev.end.date,
      dateStr,
      categorizeEvent(ev)
    );
  }

  for (const [dateStr, dayEvents] of Object.entries(eventsByDate)) {
    const features = extractCalendarFeatures(dayEvents);
    const burnout = calculateCalendarBurnoutScore(features);

    db.prepare(`
      INSERT OR REPLACE INTO calendar_features
        (user_id, date, meetings_count, work_hours, back_to_back_count, longest_block_minutes, avg_gap_minutes, calendar_burnout_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, dateStr,
      features.meetings_count, features.work_hours, features.back_to_back_count,
      features.longest_block_minutes, features.avg_gap_minutes, burnout.score
    );
  }

  return { synced: events.length, dates: Object.keys(eventsByDate).length };
}

/**
 * Categorize an event based on summary
 */
function categorizeEvent(event) {
  const summary = (event.summary || '').toLowerCase();
  if (summary.includes('meeting') || summary.includes('rapat') || summary.includes('sync') || summary.includes('standup')) return 'meeting';
  if (summary.includes('lunch') || summary.includes('break') || summary.includes('makan') || summary.includes('istirahat')) return 'break';
  if (summary.includes('deadline') || summary.includes('due') || summary.includes('submit')) return 'deadline';
  return 'event';
}

module.exports = router;
