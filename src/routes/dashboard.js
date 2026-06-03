const express = require('express');
const { getDb } = require('../config/database');
const { requireOnboarded } = require('../middleware/auth');
const { calculateComprehensiveFatigue, getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');
const { predictBurnout, predictLifestyle } = require('../utils/ml-api');

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
    
    const labelMap = { 'Terrible': 'Sangat Buruk', 'Bad': 'Buruk', 'Okay': 'Biasa', 'Good': 'Baik', 'Great': 'Sangat Baik', 'Excellent': 'Sangat Baik' };
    
    // Format dates to string so the frontend chart can read them correctly
    const moodTrend = moodTrendQuery.map(row => ({
      ...row,
      mood_label: labelMap[row.mood_label] || row.mood_label,
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

    // ML API Predictions — Burnout & Lifestyle
    let mlBurnout = null;
    let mlLifestyle = null;

    // Get user streak for burnout features
    const userStreakRow = await db.prepare('SELECT current_streak FROM users WHERE id = ?').get(userId);
    const user_streak = userStreakRow ? userStreakRow.current_streak : 0;

    try {
      // Burnout model: 12 features from user data
      // Features: [quiz_score, mood_score, energy_level, stress_level,
      //            work_hours_today, break_minutes, session_count, pomodoro_cycles,
      //            pomodoro_focus_min, total_quizzes, streak, days_since_join]
      const daysJoined = req.session.user.created_at
        ? Math.floor((Date.now() - new Date(req.session.user.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      const burnoutFeatures = [
        latestQuiz ? latestQuiz.fatigue_score : 30,           // quiz score
        latestMood ? latestMood.mood_score : 3,               // mood score
        latestMood ? (latestMood.energy_level || 3) : 3,      // energy level
        latestMood ? (latestMood.stress_level || 3) : 3,      // stress level
        todayStats.total_work / 60,                           // work hours today
        todayStats.total_break,                               // break minutes
        todayStats.session_count,                              // session count
        pomodoroToday.total_cycles,                            // pomodoro cycles
        pomodoroToday.total_focus,                             // pomodoro focus min
        todayQuizCount,                                        // quizzes today
        user_streak || 0,                                      // current streak
        daysJoined,                                            // days since join
      ];

      mlBurnout = await predictBurnout(burnoutFeatures);
      console.log('[ML-API] Burnout prediction:', mlBurnout);
    } catch (err) {
      console.warn('[ML-API] Burnout prediction failed:', err.message);
    }

    try {
      // Lifestyle model: 7 features
      // Features: [avg_mood_7d, avg_energy_7d, avg_stress_7d,
      //            avg_work_hours_7d, avg_break_ratio, pomodoro_avg_cycles, quiz_avg_score]
      const avgMood7d = moodTrend.length > 0
        ? moodTrend.reduce((s, m) => s + (m.mood_score || 3), 0) / moodTrend.length
        : 3;
      const avgEnergy7d = moodTrend.length > 0
        ? moodTrend.reduce((s, m) => s + (m.energy_level || 3), 0) / moodTrend.length
        : 3;
      const avgStress7d = moodTrend.length > 0
        ? moodTrend.reduce((s, m) => s + (m.stress_level || 3), 0) / moodTrend.length
        : 3;
      const avgWorkHours7d = recentActivities.length > 0
        ? recentActivities.reduce((s, a) => s + (a.total_work || 0), 0) / recentActivities.length / 60
        : 0;
      const avgBreakRatio7d = recentActivities.length > 0
        ? recentActivities.reduce((s, a) => {
            const total = (a.total_work || 0) + (a.total_break || 0);
            return s + (total > 0 ? (a.total_break || 0) / total : 0);
          }, 0) / recentActivities.length
        : 0;

      const lifestyleFeatures = [
        Math.round(avgMood7d * 100) / 100,
        Math.round(avgEnergy7d * 100) / 100,
        Math.round(avgStress7d * 100) / 100,
        Math.round(avgWorkHours7d * 100) / 100,
        Math.round(avgBreakRatio7d * 100) / 100,
        pomodoroToday.total_cycles,
        latestQuiz ? latestQuiz.fatigue_score : 30,
      ];

      mlLifestyle = await predictLifestyle(lifestyleFeatures);
      console.log('[ML-API] Lifestyle prediction:', mlLifestyle);
    } catch (err) {
      console.warn('[ML-API] Lifestyle prediction failed:', err.message);
    }

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
      mlBurnout,
      mlLifestyle,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).render('error', {
      title: '500 - Kesalahan Server',
      message: 'Gagal memuat data dashboard.',
      layout: 'layouts/main',
    });
  }
});

module.exports = router;