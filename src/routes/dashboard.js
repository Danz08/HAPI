const express = require('express');
const { getDb } = require('../config/database');
const { requireOnboarded } = require('../middleware/auth');
const { calculateComprehensiveFatigue, getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');

const getLocalToday = (tz = 'Asia/Jakarta') => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
};

const formatLocalDate = (d, tz = 'Asia/Jakarta') => {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(d));
};

const router = express.Router();

router.use(requireOnboarded);

// GET /dashboard
router.get('/', async (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const today = getLocalToday(req.userTz);
  const days = parseInt(req.query.days) || 7;

  try {
    // Get today's activities
    const todayActivities = await db.prepare(
      'SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at DESC'
    ).all(userId, today);

    // Get today's total work and break
    const todayStatsQuery = await db.prepare(`
      SELECT
        COALESCE(SUM(duration_minutes), 0)::integer as total_work,
        COALESCE(SUM(break_minutes), 0)::integer as total_break,
        COUNT(*)::integer as session_count
      FROM activities WHERE user_id = ? AND date = ?
    `).get(userId, today);
    const todayStats = todayStatsQuery || { total_work: 0, total_break: 0, session_count: 0 };

    // Get latest mood
    const latestMood = await db.prepare(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 1'
    ).get(userId);

    const moodTrendQuery = await db.prepare(`
      SELECT mood_score, mood_label, energy_level, stress_level,
             date as log_date, logged_at::time as log_time
      FROM mood_logs 
      WHERE user_id = ? AND date >= $2
      ORDER BY logged_at ASC
    `).all(userId, formatLocalDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000), req.userTz));
    
    // Format dates to string so the frontend chart can read them correctly
    const moodTrend = moodTrendQuery.map(row => ({
      ...row,
      log_date: row.log_date ? formatLocalDate(new Date(row.log_date), req.userTz) : null
    }));

    // Get latest quiz result
    const latestQuiz = await db.prepare(
      'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1'
    ).get(userId);

    // Get total quizzes taken today
    const todayQuizCountQuery = await db.prepare(
      'SELECT COUNT(*)::integer as count FROM quiz_results WHERE user_id = ? AND date = ?'
    ).get(userId, today);
    const todayQuizCount = todayQuizCountQuery ? todayQuizCountQuery.count : 0;

    // Get pomodoro stats for today
    const pomodoroTodayQuery = await db.prepare(`
      SELECT COALESCE(SUM(cycles_completed), 0)::integer as total_cycles,
             COALESCE(SUM(total_focus_minutes), 0)::integer as total_focus
      FROM pomodoro_sessions
      WHERE user_id = ? AND started_at::date = ?::date
    `).get(userId, today);
    const pomodoroToday = pomodoroTodayQuery || { total_cycles: 0, total_focus: 0 };

    // Get recent activities for selected days
    const recentActivities = await db.prepare(`
      SELECT date,
             SUM(duration_minutes)::integer as total_work,
             SUM(break_minutes)::integer as total_break,
             COUNT(*)::integer as sessions
      FROM activities
      WHERE user_id = ? AND date >= $2
      GROUP BY date
      ORDER BY date ASC
    `).all(userId, formatLocalDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000), req.userTz));

    // Calculate comprehensive fatigue score
    const fatigueData = calculateComprehensiveFatigue({
      quizScore: latestQuiz ? latestQuiz.fatigue_score : 30,
      avgMood: latestMood ? latestMood.mood_score : 3,
      workHoursToday: todayStats.total_work / 60,
      breakMinutes: todayStats.total_break,
    });

    const riskColor = getRiskColor(fatigueData.riskLevel);

    // Global alerts logic
    let needsMoodLog = true;
    if (latestMood) {
      if (latestMood.date === today) {
        needsMoodLog = false;
      }
    }
    let needsQuizLog = todayQuizCount === 0;
    let showMoodReminder = needsMoodLog;
    let showQuizReminder = needsQuizLog;

    // Get recommendations
    const recommendations = getRecommendations(
      fatigueData.riskLevel,
      latestMood ? latestMood.mood_score : 3
    );

    // Get Google Calendar weekly data
    const googleUser = await db.prepare('SELECT google_connected FROM users WHERE id = ?').get(userId);
    const isGoogleConnected = googleUser && googleUser.google_connected === 1 && req.session.user.login_method === 'google';

    // This week's calendar features
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStartStr = formatLocalDate(weekStart, req.userTz);
    const weekEndStr = formatLocalDate(weekEnd, req.userTz);

    const weeklyCalendarQuery = await db.prepare(`
      SELECT COALESCE(SUM(meetings_count), 0)::integer as total_meetings,
             COALESCE(AVG(work_hours), 0)::numeric as avg_work_hours,
             COALESCE(SUM(back_to_back_count), 0)::integer as total_b2b,
             COALESCE(AVG(calendar_burnout_score), 0)::numeric as avg_burnout_score,
             COUNT(*)::integer as days_with_events
      FROM calendar_features WHERE user_id = ? AND date BETWEEN ? AND ?
    `).get(userId, weekStartStr, weekEndStr);
    const weeklyCalendar = weeklyCalendarQuery || { total_meetings: 0, avg_work_hours: 0, total_b2b: 0, avg_burnout_score: 0, days_with_events: 0 };

    // Today's calendar events
    const todayCalEvents = await db.prepare(`
      SELECT * FROM calendar_events WHERE user_id = ? AND date = ? ORDER BY start_time ASC
    `).all(userId, today);

    const todayCalFeature = await db.prepare(`
      SELECT * FROM calendar_features WHERE user_id = ? AND date = ?
    `).get(userId, today);

    res.render('pages/dashboard', {
      title: 'Dashboard - HAPI',
      layout: 'layouts/main',
      pageTitle: req.t('nav.dashboard', 'Dashboard'),
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
      needsMoodLog,
      showMoodReminder,
      showQuizReminder,
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
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).render('error', {
      title: req.t('error.server_error_500', '500 - Kesalahan Server'),
      message: req.t('dashboard.load_error', 'Gagal memuat data dashboard.'),
      layout: 'layouts/main',
    });
  }
});

module.exports = router;