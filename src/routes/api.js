const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { calculateFatigueFromQuiz, getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');

const router = express.Router();
router.use(requireAuth);

// POST /api/onboard - Complete onboarding
router.post('/onboard', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE users SET is_onboarded = 1 WHERE id = ?').run(req.session.user.id);
  req.session.user.is_onboarded = 1;
  res.json({ success: true });
});

// POST /api/activities - Log a new activity
router.post('/activities', (req, res) => {
  const { activity_type, description, duration_minutes, break_minutes } = req.body;
  const today = new Date().toISOString().split('T')[0];

  const db = getDb();
  db.prepare(`
    INSERT INTO activities (user_id, activity_type, description, duration_minutes, break_minutes, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    activity_type || 'work',
    description || '',
    duration_minutes || 0,
    break_minutes || 0,
    today
  );

  res.json({ success: true });
});

// GET /api/activities - Get activities
router.get('/activities', (req, res) => {
  const { days = 7 } = req.query;
  const db = getDb();

  const activities = db.prepare(`
    SELECT date,
           SUM(duration_minutes) as total_work,
           SUM(break_minutes) as total_break,
           COUNT(*) as sessions
    FROM activities
    WHERE user_id = ? AND date >= DATE('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date ASC
  `).all(req.session.user.id, days);

  res.json({ activities });
});





// POST /api/mood - Log mood
router.post('/mood', (req, res) => {
  const { mood_score, mood_label, energy_level, stress_level, notes } = req.body;

  if (!mood_score || mood_score < 1 || mood_score > 5) {
    return res.status(400).json({ error: 'Mood score harus antara 1-5.' });
  }

  const labels = {
    1: 'Sangat Buruk', 2: 'Buruk', 3: 'Biasa', 4: 'Baik', 5: 'Sangat Baik'
  };

  const db = getDb();
  db.prepare(`
    INSERT INTO mood_logs (user_id, mood_score, mood_label, energy_level, stress_level, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    mood_score,
    mood_label || labels[mood_score] || 'Biasa',
    energy_level || null,
    stress_level || null,
    notes || null
  );

  res.json({ success: true });
});

// GET /api/mood - Get mood history
router.get('/mood', (req, res) => {
  const { limit = 14 } = req.query;
  const db = getDb();

  const moods = db.prepare(`
    SELECT mood_score, mood_label, energy_level, stress_level, notes,
           DATE(logged_at) as log_date, TIME(logged_at) as log_time
    FROM mood_logs
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT ?
  `).all(req.session.user.id, limit);

  res.json({ moods });
});





// GET /api/stats/overview
router.get('/stats/overview', (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const today = new Date().toISOString().split('T')[0];

  const todayWork = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as minutes
    FROM activities WHERE user_id = ? AND date = ?
  `).get(userId, today);

  const weekWork = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as minutes
    FROM activities WHERE user_id = ? AND date >= DATE('now', '-7 days')
  `).get(userId);

  const totalQuizzes = db.prepare(
    'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?'
  ).get(userId);

  const totalPomodoros = db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles
    FROM pomodoro_sessions WHERE user_id = ?
  `).get(userId);

  res.json({
    todayWorkMinutes: todayWork.minutes,
    weekWorkMinutes: weekWork.minutes,
    totalQuizzes: totalQuizzes.count,
    totalPomodoroCycles: totalPomodoros.cycles,
  });
});





// POST /api/pomodoro/sessions - Save completed pomodoro session
router.post('/pomodoro/sessions', (req, res) => {
  const { work_duration, break_duration, cycles_completed, total_focus_minutes } = req.body;

  const db = getDb();
  db.prepare(`
    INSERT INTO pomodoro_sessions (user_id, work_duration, break_duration, cycles_completed, total_focus_minutes, ended_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    req.session.user.id,
    work_duration || 25,
    break_duration || 5,
    cycles_completed || 1,
    total_focus_minutes || 25
  );

  // Also log as activity
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO activities (user_id, activity_type, description, duration_minutes, break_minutes, date)
    VALUES (?, 'pomodoro', ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    `Pomodoro: ${cycles_completed} siklus selesai`,
    total_focus_minutes || 25,
    (break_duration || 5) * (cycles_completed || 1),
    today
  );

  res.json({ success: true });
});

// GET /api/pomodoro/stats - Get pomodoro statistics
router.get('/pomodoro/stats', (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const today = new Date().toISOString().split('T')[0];

  const todayStats = db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
           COALESCE(SUM(total_focus_minutes), 0) as focus_minutes
    FROM pomodoro_sessions
    WHERE user_id = ? AND DATE(started_at) = ?
  `).get(userId, today);

  const weekStats = db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
           COALESCE(SUM(total_focus_minutes), 0) as focus_minutes
    FROM pomodoro_sessions
    WHERE user_id = ? AND started_at >= DATE('now', '-7 days')
  `).get(userId);

  res.json({ today: todayStats, week: weekStats });
});





// POST /api/quiz - Submit quiz answers
router.post('/quiz', (req, res) => {
  const { answers } = req.body;
  const QUIZ_QUESTION_COUNT = 10;

  if (!answers || !Array.isArray(answers) || answers.length !== QUIZ_QUESTION_COUNT) {
    return res.status(400).json({ error: 'Jawab semua pertanyaan terlebih dahulu.' });
  }

  const numericAnswers = answers.map(Number);
  const result = calculateFatigueFromQuiz(numericAnswers);
  const riskColor = getRiskColor(result.riskLevel);
  const recommendations = getRecommendations(result.riskLevel);

  // Save to database
  const db = getDb();
  db.prepare(`
    INSERT INTO quiz_results (user_id, answers, fatigue_score, risk_level, recommendations)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    JSON.stringify(numericAnswers),
    result.score,
    result.riskLevel,
    JSON.stringify(recommendations)
  );

  res.json({
    success: true,
    score: result.score,
    riskLevel: result.riskLevel,
    riskColor,
    dimensions: result.dimensions,
    recommendations,
  });
});

// GET /api/quiz/history - Get quiz history
router.get('/quiz/history', (req, res) => {
  const db = getDb();
  const history = db.prepare(
    'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 20'
  ).all(req.session.user.id);

  res.json({ history });
});




// TODO: Connect to AI API when ready
// For now, the chatbot uses client-side placeholder responses

// POST /api/chat - Send a chat message (placeholder)
router.post('/chat', (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
  }

  // TODO: Replace with actual AI API call
  res.json({
    success: true,
    response: 'Fitur AI chatbot sedang dalam pengembangan. Sementara ini, chatbot menggunakan respons lokal.',
  });
});

// DELETE /api/chat - Clear all chat messages
router.delete('/chat', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.session.user.id);
  res.json({ success: true });
});





// GET /api/analytics/day/:date - Get details for a specific day (AJAX)
router.get('/analytics/day/:date', (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const dateStr = req.params.date;

  const activities = db.prepare(`
    SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at DESC
  `).all(userId, dateStr);

  const moods = db.prepare(`
    SELECT * FROM mood_logs WHERE user_id = ? AND DATE(logged_at) = ? ORDER BY logged_at DESC
  `).all(userId, dateStr);

  const pomodoros = db.prepare(`
    SELECT * FROM pomodoro_sessions WHERE user_id = ? AND DATE(started_at) = ? ORDER BY started_at DESC
  `).all(userId, dateStr);

  const quiz = db.prepare(`
    SELECT * FROM quiz_results WHERE user_id = ? AND DATE(taken_at) = ? ORDER BY taken_at DESC LIMIT 1
  `).get(userId, dateStr);

  // Calendar events for this day
  const calEvents = db.prepare(`
    SELECT * FROM calendar_events WHERE user_id = ? AND date = ? ORDER BY start_time ASC
  `).all(userId, dateStr);

  const calFeature = db.prepare(`
    SELECT * FROM calendar_features WHERE user_id = ? AND date = ?
  `).get(userId, dateStr);

  res.json({ activities, moods, pomodoros, quiz, calEvents, calFeature, date: dateStr });
});

module.exports = router;
