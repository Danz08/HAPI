const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { calculateComprehensiveFatigue } = require('../utils/fatigue-calculator');
const { calculateCalendarBurnoutScore } = require('../utils/calendar');

const router = express.Router();
router.use(requireAuth);

// GET /analytics - Show Activity Analytics page
router.get('/', (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-indexed
  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Calculate start/end of the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // === Calendar Heatmap Data (each day of the month) ===
  const calendarData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Activities for this day
    const dayActivity = db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as work_minutes,
             COALESCE(SUM(break_minutes), 0) as break_minutes,
             COUNT(*) as sessions
      FROM activities WHERE user_id = ? AND date = ?
    `).get(userId, dateStr);

    // Mood for this day
    const dayMood = db.prepare(`
      SELECT AVG(mood_score) as avg_mood,
             AVG(energy_level) as avg_energy,
             AVG(stress_level) as avg_stress,
             COUNT(*) as mood_count
      FROM mood_logs WHERE user_id = ? AND DATE(logged_at) = ?
    `).get(userId, dateStr);

    // Pomodoro for this day
    const dayPomodoro = db.prepare(`
      SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
             COALESCE(SUM(total_focus_minutes), 0) as focus_minutes
      FROM pomodoro_sessions WHERE user_id = ? AND DATE(started_at) = ?
    `).get(userId, dateStr);

    // Quiz for this day
    const dayQuiz = db.prepare(`
      SELECT fatigue_score, risk_level
      FROM quiz_results WHERE user_id = ? AND DATE(taken_at) = ?
      ORDER BY taken_at DESC LIMIT 1
    `).get(userId, dateStr);

    // Calculate activity intensity (0-4)
    const totalMinutes = dayActivity.work_minutes + (dayPomodoro.focus_minutes || 0);
    let intensity = 0;
    if (totalMinutes > 0) intensity = 1;
    if (totalMinutes >= 60) intensity = 2;
    if (totalMinutes >= 180) intensity = 3;
    if (totalMinutes >= 360) intensity = 4;

    calendarData.push({
      date: dateStr,
      day,
      dayOfWeek: new Date(dateStr).getDay(), // 0=Sun, 6=Sat
      work_minutes: dayActivity.work_minutes,
      break_minutes: dayActivity.break_minutes,
      sessions: dayActivity.sessions,
      avg_mood: dayMood.avg_mood ? Math.round(dayMood.avg_mood * 10) / 10 : null,
      avg_energy: dayMood.avg_energy ? Math.round(dayMood.avg_energy * 10) / 10 : null,
      avg_stress: dayMood.avg_stress ? Math.round(dayMood.avg_stress * 10) / 10 : null,
      mood_count: dayMood.mood_count || 0,
      pomodoro_cycles: dayPomodoro.cycles,
      pomodoro_focus: dayPomodoro.focus_minutes,
      quiz_score: dayQuiz ? Math.round(dayQuiz.fatigue_score) : null,
      quiz_risk: dayQuiz ? dayQuiz.risk_level : null,
      intensity,
      hasData: totalMinutes > 0 || dayMood.mood_count > 0 || dayPomodoro.cycles > 0 || dayQuiz !== undefined,
    });
  }

  // === Monthly Summary Stats ===
  const monthlyWork = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total,
           COALESCE(SUM(break_minutes), 0) as total_break,
           COUNT(*) as total_sessions
    FROM activities WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const monthlyMood = db.prepare(`
    SELECT COALESCE(AVG(mood_score), 0) as avg,
           COUNT(*) as count
    FROM mood_logs WHERE user_id = ? AND DATE(logged_at) BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const monthlyPomodoro = db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
           COALESCE(SUM(total_focus_minutes), 0) as focus
    FROM pomodoro_sessions WHERE user_id = ? AND DATE(started_at) BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const monthlyQuiz = db.prepare(`
    SELECT COUNT(*) as count, AVG(fatigue_score) as avg_score
    FROM quiz_results WHERE user_id = ? AND DATE(taken_at) BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  // === Activity Type Breakdown ===
  const activityTypes = db.prepare(`
    SELECT activity_type, COUNT(*) as count, SUM(duration_minutes) as total_minutes
    FROM activities WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY activity_type ORDER BY total_minutes DESC
  `).all(userId, startDate, endDate);

  // === Mood Trend (daily averages for the month) ===
  const moodTrend = db.prepare(`
    SELECT DATE(logged_at) as date, AVG(mood_score) as score
    FROM mood_logs WHERE user_id = ? AND DATE(logged_at) BETWEEN ? AND ?
    GROUP BY DATE(logged_at) ORDER BY date ASC
  `).all(userId, startDate, endDate).map(r => ({
    date: r.date,
    label: formatDateShort(r.date),
    score: Math.round(r.score * 10) / 10,
  }));

  // === Work Trend (daily totals for the month) ===
  const workTrend = db.prepare(`
    SELECT date, SUM(duration_minutes) as work, SUM(break_minutes) as breakMin
    FROM activities WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY date ORDER BY date ASC
  `).all(userId, startDate, endDate).map(r => ({
    date: r.date,
    label: formatDateShort(r.date),
    work: r.work,
    breakMin: r.breakMin,
  }));

  // === Active Days Count (including calendar meetings) ===
  const calendarDays = db.prepare(`
    SELECT COUNT(DISTINCT date) as count FROM calendar_features 
    WHERE user_id = ? AND date BETWEEN ? AND ? AND meetings_count > 0
  `).get(userId, startDate, endDate);
  const activeDays = Math.max(
    calendarData.filter(d => d.hasData).length,
    calendarDays ? calendarDays.count : 0
  );

  // === Streak Calculation ===
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const hasActivity = db.prepare(`
      SELECT COUNT(*) as c FROM activities WHERE user_id = ? AND date = ?
    `).get(userId, dateStr).c > 0;

    const hasMood = db.prepare(`
      SELECT COUNT(*) as c FROM mood_logs WHERE user_id = ? AND DATE(logged_at) = ?
    `).get(userId, dateStr).c > 0;

    const hasPomodoro = db.prepare(`
      SELECT COUNT(*) as c FROM pomodoro_sessions WHERE user_id = ? AND DATE(started_at) = ?
    `).get(userId, dateStr).c > 0;

    if (hasActivity || hasMood || hasPomodoro) {
      streak++;
    } else {
      break;
    }
  }

  // === Google Calendar Data ===
  const googleUser = db.prepare('SELECT google_connected FROM users WHERE id = ?').get(userId);
  const isGoogleConnected = googleUser && googleUser.google_connected === 1;

  // Calendar features for the month
  const calendarFeatures = db.prepare(`
    SELECT * FROM calendar_features
    WHERE user_id = ? AND date BETWEEN ? AND ?
    ORDER BY date ASC
  `).all(userId, startDate, endDate);

  // Monthly calendar summary
  const monthlyCalendar = db.prepare(`
    SELECT COALESCE(SUM(meetings_count), 0) as total_meetings,
           COALESCE(AVG(work_hours), 0) as avg_work_hours,
           COALESCE(SUM(back_to_back_count), 0) as total_b2b,
           COALESCE(AVG(calendar_burnout_score), 0) as avg_burnout_score,
           COUNT(*) as days_with_events
    FROM calendar_features
    WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  // Merge calendar features into calendarData
  const calFeatureMap = {};
  calendarFeatures.forEach(cf => { calFeatureMap[cf.date] = cf; });
  calendarData.forEach(cd => {
    const cf = calFeatureMap[cd.date];
    if (cf) {
      cd.cal_meetings = cf.meetings_count;
      cd.cal_work_hours = cf.work_hours;
      cd.cal_b2b = cf.back_to_back_count;
      cd.cal_burnout = Math.round(cf.calendar_burnout_score);
    } else {
      cd.cal_meetings = 0;
      cd.cal_work_hours = 0;
      cd.cal_b2b = 0;
      cd.cal_burnout = 0;
    }
  });

  // === Generate Insights ===
  const insights = generateMonthlyInsights({
    monthlyWork, monthlyMood, monthlyPomodoro, monthlyQuiz,
    activeDays, daysInMonth, streak, activityTypes, monthlyCalendar, isGoogleConnected,
  });

  // Month metadata
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = monthNames[month - 1];

  // Previous/next month for navigation
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

  res.render('pages/analytics', {
    title: 'Activity Analytics - HAPI',
    layout: 'layouts/main',
    calendarData,
    monthlyWork,
    monthlyMood,
    monthlyPomodoro,
    monthlyQuiz,
    activityTypes,
    moodTrend,
    workTrend,
    activeDays,
    daysInMonth,
    streak,
    insights,
    month, year, monthName,
    prevMonth, prevYear, nextMonth, nextYear,
    firstDayOfWeek,
    isGoogleConnected,
    monthlyCalendar,
    calendarFeatures,
  });
});

// JSON API endpoint GET /day/:date moved to /api/analytics/day/:date (see src/routes/api.js)

// Helper: Format date to short form
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}`;
}

// Helper: Generate monthly insights
function generateMonthlyInsights({ monthlyWork, monthlyMood, monthlyPomodoro, monthlyQuiz, activeDays, daysInMonth, streak, activityTypes, monthlyCalendar, isGoogleConnected }) {
  const insights = [];

  // Consistency insight
  const consistency = Math.round((activeDays / daysInMonth) * 100);
  if (consistency >= 80) {
    insights.push({
      icon: '🔥', title: 'Konsistensi Luar Biasa',
      description: `${activeDays} dari ${daysInMonth} hari aktif (${consistency}%). Kamu sangat konsisten!`,
      color: 'success'
    });
  } else if (consistency >= 50) {
    insights.push({
      icon: '📊', title: 'Konsistensi Baik',
      description: `${activeDays} dari ${daysInMonth} hari aktif. Coba tingkatkan lagi ya!`,
      color: 'brand'
    });
  } else {
    insights.push({
      icon: '📈', title: 'Tingkatkan Konsistensi',
      description: `Baru ${activeDays} hari aktif bulan ini. Coba rutin tracking setiap hari.`,
      color: 'warning'
    });
  }

  // Streak insight
  if (streak >= 7) {
    insights.push({
      icon: '🔥', title: `Streak ${streak} Hari!`,
      description: 'Konsistensimu luar biasa! Terus pertahankan kebiasaan positif ini.',
      color: 'success'
    });
  } else if (streak >= 3) {
    insights.push({
      icon: '⚡', title: `Streak ${streak} Hari`,
      description: 'Bagus! Terus jaga momentum harianmu.',
      color: 'brand'
    });
  }

  // Work insight
  const totalHours = Math.round(monthlyWork.total / 60);
  const avgDailyWork = activeDays > 0 ? Math.round(monthlyWork.total / activeDays) : 0;
  if (totalHours > 0) {
    insights.push({
      icon: '💼', title: `${totalHours} Jam Kerja`,
      description: `Total ${monthlyWork.total_sessions} sesi kerja. Rata-rata ${avgDailyWork} menit/hari aktif.`,
      color: avgDailyWork > 480 ? 'danger' : 'brand'
    });
  }

  // Mood insight
  if (monthlyMood.count > 0) {
    const avgMood = Math.round(monthlyMood.avg * 10) / 10;
    const moodLabel = avgMood >= 4 ? 'Positif 😊' : avgMood >= 3 ? 'Stabil 😐' : 'Perlu Perhatian 😟';
    insights.push({
      icon: avgMood >= 4 ? '😊' : avgMood >= 3 ? '😐' : '😟',
      title: `Mood ${moodLabel}`,
      description: `Rata-rata mood ${avgMood}/5 dari ${monthlyMood.count} log.`,
      color: avgMood >= 4 ? 'success' : avgMood >= 3 ? 'warning' : 'danger'
    });
  }

  // Pomodoro insight
  if (monthlyPomodoro.cycles > 0) {
    insights.push({
      icon: '🍅', title: `${monthlyPomodoro.cycles} Siklus Pomodoro`,
      description: `Total ${monthlyPomodoro.focus} menit fokus melalui Pomodoro.`,
      color: 'success'
    });
  }

  // Quiz insight
  if (monthlyQuiz.count > 0) {
    const avgScore = Math.round(monthlyQuiz.avg_score);
    insights.push({
      icon: '📋', title: `${monthlyQuiz.count} Quiz Selesai`,
      description: `Rata-rata skor fatigue ${avgScore}%. ${avgScore > 65 ? 'Perhatikan kondisimu.' : 'Kondisi cukup baik.'}`,
      color: avgScore > 65 ? 'danger' : avgScore > 35 ? 'warning' : 'success'
    });
  }

  // Google Calendar burnout insight
  if (isGoogleConnected && monthlyCalendar && monthlyCalendar.days_with_events > 0) {
    const avgBurnout = Math.round(monthlyCalendar.avg_burnout_score);
    const totalMeetings = monthlyCalendar.total_meetings;
    const avgWorkH = Math.round(monthlyCalendar.avg_work_hours * 10) / 10;
    const totalB2B = monthlyCalendar.total_b2b;

    // Meeting load insight
    insights.push({
      icon: '📅', title: `${totalMeetings} Meeting (${monthlyCalendar.days_with_events} hari)`,
      description: `Rata-rata jadwal ${avgWorkH} jam/hari. ${totalB2B > 0 ? totalB2B + ' meeting back-to-back terdeteksi.' : 'Jarak antar meeting cukup baik.'}`,
      color: avgBurnout > 65 ? 'danger' : avgBurnout > 35 ? 'warning' : 'success'
    });

    // Calendar burnout risk
    if (avgBurnout > 65) {
      insights.push({
        icon: '🔥', title: 'Risiko Burnout Tinggi (Kalender)',
        description: `Skor burnout kalender ${avgBurnout}%. Jadwalmu terlalu padat — pertimbangkan mengurangi meeting atau menambah jeda.`,
        color: 'danger'
      });
    } else if (avgBurnout > 35) {
      insights.push({
        icon: '⚠️', title: 'Risiko Burnout Sedang (Kalender)',
        description: `Skor burnout kalender ${avgBurnout}%. Jadwalmu cukup padat. Pastikan ada waktu istirahat.`,
        color: 'warning'
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      icon: '🚀', title: 'Mulai Tracking',
      description: 'Belum ada data bulan ini. Mulai log aktivitas, mood, dan ambil quiz!',
      color: 'brand'
    });
  }

  return insights;
}

module.exports = router;
