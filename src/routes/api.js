const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { calculateFatigueFromQuiz, getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');

const getLocalToday = (req) => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: req.userTz || 'Asia/Jakarta' }).format(new Date());
};

const router = express.Router();
router.use(requireAuth);

// POST /api/onboard - Complete onboarding
router.post('/onboard', async (req, res) => {
  const db = getDb();
  await db.prepare('UPDATE users SET is_onboarded = 1 WHERE id = ?').run(req.session.user.id);
  req.session.user.is_onboarded = 1;
  res.json({ success: true });
});

// POST /api/activities - Log a new activity
router.post('/activities', async (req, res) => {
  const { activity_type, description, duration_minutes, break_minutes } = req.body;
  const today = getLocalToday(req);

  const db = getDb();
  await db.prepare(`
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
router.get('/activities', async (req, res) => {
  const { days = 7 } = req.query;
  const db = getDb();

  const activities = await db.prepare(`
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
router.post('/mood', async (req, res) => {
  const { mood_score, mood_label, energy_level, stress_level, notes } = req.body;

  if (!mood_score || mood_score < 1 || mood_score > 5) {
    return res.status(400).json({ error: req.t('validation.mood_score_invalid', 'Mood score harus antara 1-5.') });
  }

  const labels = {
    1: req.t('mood.1', 'Sangat Buruk'),
    2: req.t('mood.2', 'Buruk'),
    3: req.t('mood.3', 'Biasa'),
    4: req.t('mood.4', 'Baik'),
    5: req.t('mood.5', 'Sangat Baik')
  };

  const today = getLocalToday(req);

  const db = getDb();

  // Check if already logged mood today
  const existingMood = await db.prepare(
    'SELECT id FROM mood_logs WHERE user_id = ? AND date = ? LIMIT 1'
  ).get(req.session.user.id, today);

  if (existingMood) {
    return res.status(400).json({ error: req.t('validation.mood_already_logged', 'Kamu sudah mencatat mood hari ini. Coba lagi besok!'), alreadyLogged: true });
  }

  await db.prepare(`
    INSERT INTO mood_logs (user_id, mood_score, mood_label, energy_level, stress_level, notes, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    mood_score,
    mood_label || labels[mood_score] || req.t('mood.3', 'Biasa'),
    energy_level || null,
    stress_level || null,
    notes || null,
    today
  );

  res.json({ success: true });
});

// GET /api/mood - Get mood history
router.get('/mood', async (req, res) => {
  const { limit = 14 } = req.query;
  const db = getDb();

  const moods = await db.prepare(`
    SELECT mood_score, mood_label, energy_level, stress_level, notes,
           date as log_date, logged_at::time as log_time
    FROM mood_logs
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT ?
  `).all(req.session.user.id, limit);

  res.json({ moods });
});





// GET /api/stats/overview
router.get('/stats/overview', async (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const today = getLocalToday(req);

  const todayWork = await db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as minutes
    FROM activities WHERE user_id = ? AND date = ?
  `).get(userId, today);

  const weekWork = await db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as minutes
    FROM activities WHERE user_id = ? AND date >= DATE('now', '-7 days')
  `).get(userId);

  const totalQuizzes = await db.prepare(
    'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?'
  ).get(userId);

  const totalPomodoros = await db.prepare(`
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
router.post('/pomodoro/sessions', async (req, res) => {
  const { work_duration, break_duration, cycles_completed, total_focus_minutes } = req.body;

  const today = getLocalToday(req);
  const db = getDb();
  await db.prepare(`
    INSERT INTO pomodoro_sessions (user_id, work_duration, break_duration, cycles_completed, total_focus_minutes, date, ended_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    req.session.user.id,
    work_duration || 25,
    break_duration || 5,
    cycles_completed || 1,
    total_focus_minutes || 25,
    today
  );

  // Also log as activity
  await db.prepare(`
    INSERT INTO activities (user_id, activity_type, description, duration_minutes, break_minutes, date)
    VALUES (?, 'pomodoro', ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    req.t('pomodoro.pomodoro_completed_log', { cycles: cycles_completed, defaultValue: `Pomodoro: ${cycles_completed} siklus selesai` }),
    total_focus_minutes || 25,
    (break_duration || 5) * (cycles_completed || 1),
    today
  );

  res.json({ success: true });
});

// GET /api/pomodoro/stats - Get pomodoro statistics
router.get('/pomodoro/stats', async (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const today = getLocalToday(req);

  const todayStats = await db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
           COALESCE(SUM(total_focus_minutes), 0) as focus_minutes
    FROM pomodoro_sessions
    WHERE user_id = ? AND date = ?
  `).get(userId, today);

  const weekStats = await db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
           COALESCE(SUM(total_focus_minutes), 0) as focus_minutes
    FROM pomodoro_sessions
    WHERE user_id = ? AND started_at >= DATE('now', '-7 days')
  `).get(userId);

  res.json({ today: todayStats, week: weekStats });
});





// POST /api/quiz - Submit quiz answers
router.post('/quiz', async (req, res) => {
  const { answers } = req.body;
  const QUIZ_QUESTION_COUNT = 15;

  if (!answers || !Array.isArray(answers) || answers.length !== QUIZ_QUESTION_COUNT) {
    return res.status(400).json({ error: req.t('validation.quiz_incomplete', 'Jawab semua pertanyaan terlebih dahulu.') });
  }

  const numericAnswers = answers.map(Number);
  const result = calculateFatigueFromQuiz(numericAnswers);
  const riskColor = getRiskColor(result.riskLevel);
  const recommendations = getRecommendations(result.riskLevel);

  const today = getLocalToday(req);
  const db = getDb();

  // Check if already took quiz today
  const existingQuiz = await db.prepare(
    'SELECT id FROM quiz_results WHERE user_id = ? AND date = ? LIMIT 1'
  ).get(req.session.user.id, today);

  if (existingQuiz) {
    return res.status(400).json({ error: req.t('validation.quiz_already_taken', 'Kamu sudah mengisi quiz hari ini. Coba lagi besok!') });
  }

  // Save to database
  await db.prepare(`
    INSERT INTO quiz_results (user_id, answers, fatigue_score, risk_level, recommendations, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.session.user.id,
    JSON.stringify(numericAnswers),
    result.score,
    result.riskLevel,
    JSON.stringify(recommendations),
    today
  );
  
  // Calculate streak
  const user = await db.prepare('SELECT current_streak, longest_streak, last_streak_date FROM users WHERE id = ?').get(req.session.user.id);
  let streak = user.current_streak || 0;
  let longest = user.longest_streak || 0;
  let lastDate = user.last_streak_date;
  let streakUpdated = false;

  if (lastDate !== today) {
    if (lastDate) {
      const last = new Date(lastDate);
      const curr = new Date(today);
      const diff = Math.floor((curr - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
    } else {
      streak = 1;
    }
    
    if (streak > longest) {
      longest = streak;
    }
    
    await db.prepare('UPDATE users SET current_streak = ?, longest_streak = ?, last_streak_date = ? WHERE id = ?').run(streak, longest, today, req.session.user.id);
    streakUpdated = true;
  }

  res.json({
    success: true,
    score: result.score,
    riskLevel: result.riskLevel,
    riskColor,
    dimensions: result.dimensions,
    dimensionAverages: result.dimensionAverages,
    recommendations,
    streak,
    streakUpdated
  });
});

// GET /api/quiz/history - Get quiz history
router.get('/quiz/history', async (req, res) => {
  const db = getDb();
  const history = await db.prepare(
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
    return res.status(400).json({ error: req.t('validation.empty_message', 'Pesan tidak boleh kosong.') });
  }

  // TODO: Replace with actual AI API call
  res.json({
    success: true,
    response: req.t('chat.dev_mode', 'Fitur AI chatbot sedang dalam pengembangan. Sementara ini, chatbot menggunakan respons lokal.'),
  });
});

// DELETE /api/chat - Clear all chat messages
router.delete('/chat', async (req, res) => {
  const db = getDb();
  await db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.session.user.id);
  res.json({ success: true });
});





// GET /api/analytics/day/:date - Get details for a specific day (AJAX)
router.get('/analytics/day/:date', async (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const dateStr = req.params.date;

  const activities = await db.prepare(`
    SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at DESC
  `).all(userId, dateStr);

  const moods = await db.prepare(`
    SELECT * FROM mood_logs WHERE user_id = ? AND date = ? ORDER BY logged_at DESC
  `).all(userId, dateStr);

  const pomodoros = await db.prepare(`
    SELECT * FROM pomodoro_sessions WHERE user_id = ? AND date = ? ORDER BY started_at DESC
  `).all(userId, dateStr);

  const quiz = await db.prepare(`
    SELECT * FROM quiz_results WHERE user_id = ? AND date = ? ORDER BY taken_at DESC LIMIT 1
  `).get(userId, dateStr);

  // Calendar events for this day
  const calEvents = await db.prepare(`
    SELECT * FROM calendar_events WHERE user_id = ? AND date = ? ORDER BY start_time ASC
  `).all(userId, dateStr);

  const calFeature = await db.prepare(`
    SELECT * FROM calendar_features WHERE user_id = ? AND date = ?
  `).get(userId, dateStr);

  res.json({ activities, moods, pomodoros, quiz, calEvents, calFeature, date: dateStr });
});

module.exports = router;
