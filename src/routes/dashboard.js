const express = require('express');
const { getDb } = require('../config/database');
const { requireOnboarded } = require('../middleware/auth');
const { calculateComprehensiveFatigue, getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');

const router = express.Router();

router.use(requireOnboarded);

// GET /dashboard
router.get('/', (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const today = new Date().toISOString().split('T')[0];
  const days = parseInt(req.query.days) || 7;

  // Get today's activities
  const todayActivities = db.prepare(
    'SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at DESC'
  ).all(userId, today);

  // Get today's total work and break
  const todayStats = db.prepare(`
    SELECT
      COALESCE(SUM(duration_minutes), 0) as total_work,
      COALESCE(SUM(break_minutes), 0) as total_break,
      COUNT(*) as session_count
    FROM activities WHERE user_id = ? AND date = ?
  `).get(userId, today);

  // Get latest mood
  const latestMood = db.prepare(
    'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 1'
  ).get(userId);

  // Get mood trend for selected days
  const moodTrend = db.prepare(`
    SELECT mood_score, mood_label, energy_level, stress_level,
           DATE(logged_at) as log_date, TIME(logged_at) as log_time
    FROM mood_logs WHERE user_id = ? AND DATE(logged_at) >= DATE('now', '-' || ? || ' days')
    ORDER BY logged_at ASC
  `).all(userId, days);

  // Get latest quiz result
  const latestQuiz = db.prepare(
    'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1'
  ).get(userId);

  // Get total quizzes taken today
  const todayQuizCountQuery = db.prepare(
    'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ? AND DATE(taken_at) = ?'
  ).get(userId, today);
  const todayQuizCount = todayQuizCountQuery ? todayQuizCountQuery.count : 0;

  // Get pomodoro stats for today
  const pomodoroToday = db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as total_cycles,
           COALESCE(SUM(total_focus_minutes), 0) as total_focus
    FROM pomodoro_sessions
    WHERE user_id = ? AND DATE(started_at) = ?
  `).get(userId, today);

  // Get recent activities for selected days
  const recentActivities = db.prepare(`
    SELECT date,
           SUM(duration_minutes) as total_work,
           SUM(break_minutes) as total_break,
           COUNT(*) as sessions
    FROM activities
    WHERE user_id = ? AND date >= DATE('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date ASC
  `).all(userId, days);

  // Calculate comprehensive fatigue score
  const fatigueData = calculateComprehensiveFatigue({
    quizScore: latestQuiz ? latestQuiz.fatigue_score : 30,
    avgMood: latestMood ? latestMood.mood_score : 3,
    workHoursToday: todayStats.total_work / 60,
    breakMinutes: todayStats.total_break,
  });

  const riskColor = getRiskColor(fatigueData.riskLevel);

  // Get recommendations
  const recommendations = getRecommendations(
    fatigueData.riskLevel,
    latestMood ? latestMood.mood_score : 3
  );

  // Get Google Calendar weekly data
  const googleUser = db.prepare('SELECT google_connected FROM users WHERE id = ?').get(userId);
  const isGoogleConnected = googleUser && googleUser.google_connected === 1;

  // This week's calendar features
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const weeklyCalendar = db.prepare(`
    SELECT COALESCE(SUM(meetings_count), 0) as total_meetings,
           COALESCE(AVG(work_hours), 0) as avg_work_hours,
           COALESCE(SUM(back_to_back_count), 0) as total_b2b,
           COALESCE(AVG(calendar_burnout_score), 0) as avg_burnout_score,
           COUNT(*) as days_with_events
    FROM calendar_features WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, weekStartStr, weekEndStr);

  // Today's calendar events
  const todayCalEvents = db.prepare(`
    SELECT * FROM calendar_events WHERE user_id = ? AND date = ? ORDER BY start_time ASC
  `).all(userId, today);

  const todayCalFeature = db.prepare(`
    SELECT * FROM calendar_features WHERE user_id = ? AND date = ?
  `).get(userId, today);

  res.render('pages/dashboard', {
    title: 'Dashboard - HAPI',
    layout: 'layouts/main',
    pageTitle: 'Dashboard',
    pageKey: 'page.dashboard',
    todayStats,
    todayActivities,
    latestMood,
    moodTrend,
    latestQuiz,
    todayQuizCount,
    pomodoroToday,
    recentActivities,
    fatigueData,
    riskColor,
    recommendations,
    today,
    isGoogleConnected,
    weeklyCalendar,
    todayCalEvents,
    todayCalFeature,
    weekStartStr,
    weekEndStr,
    selectedDays: days,
  });
});

module.exports = router;
