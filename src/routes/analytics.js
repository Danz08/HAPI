const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth, requireOnboarded } = require('../middleware/auth');
const { calculateComprehensiveFatigue } = require('../utils/fatigue-calculator');
const { calculateCalendarBurnoutScore } = require('../utils/calendar');

const getLocalToday = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
};

const formatLocalDate = (d) => {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(d));
};

const router = express.Router();
router.use(requireAuth);
router.use(requireOnboarded);

router.get('/', async (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const calendarData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayActivity = await db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as work_minutes,
             COALESCE(SUM(break_minutes), 0) as break_minutes,
             COUNT(*) as sessions
      FROM activities WHERE user_id = ? AND date = ?
    `).get(userId, dateStr);

    const dayMood = await db.prepare(`
      SELECT AVG(mood_score) as avg_mood,
             AVG(energy_level) as avg_energy,
             AVG(stress_level) as avg_stress
     FROM mood_logs WHERE user_id = ? AND date = ?
    `).get(userId, dateStr);
    const hasMood = (await db.prepare(`
      SELECT COUNT(*) as c FROM mood_logs WHERE user_id = ? AND date = ?
    `).get(userId, dateStr)).c;

    const dayPomodoro = await db.prepare(`
      SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
             COALESCE(SUM(total_focus_minutes), 0) as focus_minutes
      FROM pomodoro_sessions WHERE user_id = ? AND date = ?
    `).get(userId, dateStr);

    const dayQuiz = await db.prepare(`
      SELECT fatigue_score, risk_level
      FROM quiz_results WHERE user_id = ? AND date = ?
      ORDER BY taken_at DESC LIMIT 1
    `).get(userId, dateStr);

    // In postgres, SUM returns a string/BigInt sometimes, we need to ensure it's a number
    const workMinutes = Number(dayActivity?.work_minutes) || 0;
    const focusMinutes = Number(dayPomodoro?.focus_minutes) || 0;
    const moodCount = Number(dayMood?.mood_count) || 0;
    const cycles = Number(dayPomodoro?.cycles) || 0;

    const totalMinutes = workMinutes + focusMinutes;
    let intensity = 0;
    if (totalMinutes > 0) intensity = 1;
    if (totalMinutes >= 60) intensity = 2;
    if (totalMinutes >= 180) intensity = 3;
    if (totalMinutes >= 360) intensity = 4;

    calendarData.push({
      date: dateStr,
      day,
      dayOfWeek: new Date(dateStr).getDay(),
      work_minutes: workMinutes,
      break_minutes: Number(dayActivity?.break_minutes) || 0,
      sessions: Number(dayActivity?.sessions) || 0,
      avg_mood: dayMood?.avg_mood ? Math.round(Number(dayMood.avg_mood) * 10) / 10 : null,
      avg_energy: dayMood?.avg_energy ? Math.round(Number(dayMood.avg_energy) * 10) / 10 : null,
      avg_stress: dayMood?.avg_stress ? Math.round(Number(dayMood.avg_stress) * 10) / 10 : null,
      mood_count: moodCount,
      pomodoro_cycles: cycles,
      pomodoro_focus: focusMinutes,
      quiz_score: dayQuiz ? Math.round(Number(dayQuiz.fatigue_score)) : null,
      quiz_risk: dayQuiz ? dayQuiz.risk_level : null,
      intensity,
      hasData: totalMinutes > 0 || moodCount > 0 || cycles > 0 || dayQuiz !== undefined,
    });
  }

  const monthlyWork = await db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total,
           COALESCE(SUM(break_minutes), 0) as total_break,
           COUNT(*) as total_sessions
    FROM activities WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const monthlyMood = await db.prepare(`
    SELECT COALESCE(AVG(mood_score), 0) as avg,
           COUNT(*) as count
    FROM mood_logs WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const monthlyPomodoro = await db.prepare(`
    SELECT COALESCE(SUM(cycles_completed), 0) as cycles,
           COALESCE(SUM(total_focus_minutes), 0) as focus
    FROM pomodoro_sessions WHERE user_id = ? AND DATE(started_at) BETWEEN DATE(?) AND DATE(?)
  `).get(userId, startDate, endDate);

  const monthlyQuiz = await db.prepare(`
    SELECT COUNT(*) as count, AVG(fatigue_score) as avg_score
    FROM quiz_results WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const activityTypes = await db.prepare(`
    SELECT activity_type, COUNT(*) as count, SUM(duration_minutes) as total_minutes
    FROM activities WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY activity_type ORDER BY total_minutes DESC
  `).all(userId, startDate, endDate);

  const moodTrendRaw = await db.prepare(`
    SELECT date, AVG(mood_score) as score
    FROM mood_logs WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY date ORDER BY date ASC
  `).all(userId, startDate, endDate);
  
  const moodTrend = moodTrendRaw.map(r => ({
    date: r.date,
    label: formatDateShort(r.date),
    score: Math.round(Number(r.score) * 10) / 10,
  }));

  const workTrendRaw = await db.prepare(`
    SELECT date, SUM(duration_minutes) as work, SUM(break_minutes) as breakMin
    FROM activities WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY date ORDER BY date ASC
  `).all(userId, startDate, endDate);
  
  const workTrend = workTrendRaw.map(r => ({
    date: r.date,
    label: formatDateShort(r.date),
    work: Number(r.work),
    breakMin: Number(r.breakMin),
  }));

  const calendarDays = await db.prepare(`
    SELECT COUNT(DISTINCT date) as count FROM calendar_features 
    WHERE user_id = ? AND date BETWEEN ? AND ? AND meetings_count > 0
  `).get(userId, startDate, endDate);

  const activeDays = Math.max(
    calendarData.filter(d => d.hasData).length,
    calendarDays ? Number(calendarDays.count) : 0
  );

  const userRow = await db.prepare('SELECT current_streak, longest_streak, last_streak_date FROM users WHERE id = ?').get(userId);
  let streak = userRow ? userRow.current_streak : 0;
  const longest_streak = userRow ? userRow.longest_streak : 0;
  
  const todayDate = getLocalToday();
  if (userRow && userRow.last_streak_date) {
    const lastDate = new Date(userRow.last_streak_date);
    const currDate = new Date(todayDate);
    const diffTime = currDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      streak = 0;
    }
  }

  const googleUser = await db.prepare('SELECT google_connected FROM users WHERE id = ?').get(userId);
  const isGoogleConnected = googleUser && googleUser.google_connected === 1 && req.session.user.login_method === 'google';

  const calendarFeatures = await db.prepare(`
    SELECT * FROM calendar_features
    WHERE user_id = ? AND date BETWEEN ? AND ?
    ORDER BY date ASC
  `).all(userId, startDate, endDate);

  const monthlyCalendar = await db.prepare(`
    SELECT COALESCE(SUM(meetings_count), 0) as total_meetings,
           COALESCE(AVG(work_hours), 0) as avg_work_hours,
           COALESCE(SUM(back_to_back_count), 0) as total_b2b,
           COALESCE(AVG(calendar_burnout_score), 0) as avg_burnout_score,
           COUNT(*) as days_with_events
    FROM calendar_features
    WHERE user_id = ? AND date BETWEEN ? AND ?
  `).get(userId, startDate, endDate);

  const calFeatureMap = {};
  calendarFeatures.forEach(cf => { calFeatureMap[cf.date] = cf; });
  calendarData.forEach(cd => {
    const cf = calFeatureMap[cd.date];
    if (cf) {
      cd.cal_meetings = Number(cf.meetings_count);
      cd.cal_work_hours = Number(cf.work_hours);
      cd.cal_b2b = Number(cf.back_to_back_count);
      cd.cal_burnout = Math.round(Number(cf.calendar_burnout_score));
    } else {
      cd.cal_meetings = 0;
      cd.cal_work_hours = 0;
      cd.cal_b2b = 0;
      cd.cal_burnout = 0;
    }
  });

  const insights = generateMonthlyInsights({
    monthlyWork: { total: Number(monthlyWork?.total)||0, total_sessions: Number(monthlyWork?.total_sessions)||0 }, 
    monthlyMood: { avg: Number(monthlyMood?.avg)||0, count: Number(monthlyMood?.count)||0 }, 
    monthlyPomodoro: { cycles: Number(monthlyPomodoro?.cycles)||0, focus: Number(monthlyPomodoro?.focus)||0 }, 
    monthlyQuiz: { count: Number(monthlyQuiz?.count)||0, avg_score: Number(monthlyQuiz?.avg_score)||0 }, 
    activeDays, daysInMonth, streak, activityTypes, 
    monthlyCalendar: {
      days_with_events: Number(monthlyCalendar?.days_with_events)||0,
      avg_burnout_score: Number(monthlyCalendar?.avg_burnout_score)||0,
      total_meetings: Number(monthlyCalendar?.total_meetings)||0,
      avg_work_hours: Number(monthlyCalendar?.avg_work_hours)||0,
      total_b2b: Number(monthlyCalendar?.total_b2b)||0
    }, 
    isGoogleConnected,
  });

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = monthNames[month - 1];

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  res.render('pages/analytics', {
    title: 'Analytics - HAPI',
    layout: 'layouts/main',
    pageTitle: 'Analitik',
    pageKey: 'page.analytics',
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
    longest_streak,
    insights,
    month, year, monthName,
    prevMonth, prevYear, nextMonth, nextYear,
    firstDayOfWeek,
    isGoogleConnected,
    monthlyCalendar,
    calendarFeatures,
  });
});

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}`;
}

function generateMonthlyInsights({ monthlyWork, monthlyMood, monthlyPomodoro, monthlyQuiz, activeDays, daysInMonth, streak, activityTypes, monthlyCalendar, isGoogleConnected }) {
  const insights = [];

  const consistency = Math.round((activeDays / daysInMonth) * 100);
  if (consistency >= 80) {
    insights.push({ icon: '<i data-lucide="flame" class="w-5 h-5 text-success-500"></i>', title: 'Konsistensi Luar Biasa', title_en: 'Amazing Consistency', description: `${activeDays} dari ${daysInMonth} hari aktif (${consistency}%). Kamu sangat konsisten!`, desc_en: `${activeDays} of ${daysInMonth} active days (${consistency}%). You're very consistent!`, color: 'success' });
  } else if (consistency >= 50) {
    insights.push({ icon: '<i data-lucide="bar-chart-2" class="w-5 h-5 text-brand-500"></i>', title: 'Konsistensi Baik', title_en: 'Good Consistency', description: `${activeDays} dari ${daysInMonth} hari aktif. Coba tingkatkan lagi ya!`, desc_en: `${activeDays} of ${daysInMonth} active days. Try to improve further!`, color: 'brand' });
  } else {
    insights.push({ icon: '<i data-lucide="trending-down" class="w-5 h-5 text-warning-500"></i>', title: 'Tingkatkan Konsistensi', title_en: 'Improve Consistency', description: `Baru ${activeDays} hari aktif bulan ini. Coba rutin tracking setiap hari.`, desc_en: `Only ${activeDays} active days this month. Try tracking daily.`, color: 'warning' });
  }

  if (streak >= 7) {
    insights.push({ icon: '<i data-lucide="zap" class="w-5 h-5 text-success-500"></i>', title: `Streak ${streak} Hari!`, title_en: `${streak}-Day Streak!`, description: 'Konsistensimu luar biasa! Terus pertahankan kebiasaan positif ini.', desc_en: 'Your consistency is amazing! Keep up the positive habits.', color: 'success' });
  } else if (streak >= 3) {
    insights.push({ icon: '<i data-lucide="activity" class="w-5 h-5 text-brand-500"></i>', title: `Streak ${streak} Hari`, title_en: `${streak}-Day Streak`, description: 'Bagus! Terus jaga momentum harianmu.', desc_en: 'Good! Keep your daily momentum going.', color: 'brand' });
  }

  const totalHours = Math.round(monthlyWork.total / 60);
  const avgDailyWork = activeDays > 0 ? Math.round(monthlyWork.total / activeDays) : 0;
  if (totalHours > 0) {
    insights.push({ icon: '<i data-lucide="briefcase" class="w-5 h-5 text-brand-500"></i>', title: `${totalHours} Jam Kerja`, title_en: `${totalHours} Work Hours`, description: `Total ${monthlyWork.total_sessions} sesi kerja. Rata-rata ${avgDailyWork} menit/hari aktif.`, desc_en: `Total ${monthlyWork.total_sessions} work sessions. Average ${avgDailyWork} min/active day.`, color: avgDailyWork > 480 ? 'danger' : 'brand' });
  }

  if (monthlyMood.count > 0) {
    const avgMood = Math.round(monthlyMood.avg * 10) / 10;
    const moodLabel = avgMood >= 4 ? 'Positif' : avgMood >= 3 ? 'Stabil' : 'Perlu Perhatian';
    const moodLabelEn = avgMood >= 4 ? 'Positive' : avgMood >= 3 ? 'Stable' : 'Needs Attention';
    const moodIcon = avgMood >= 4 ? '<i data-lucide="smile" class="w-5 h-5 text-success-500"></i>' : avgMood >= 3 ? '<i data-lucide="meh" class="w-5 h-5 text-warning-500"></i>' : '<i data-lucide="frown" class="w-5 h-5 text-danger-500"></i>';
    insights.push({ icon: moodIcon, title: `Mood ${moodLabel}`, title_en: `Mood: ${moodLabelEn}`, description: `Rata-rata mood ${avgMood}/5 dari ${monthlyMood.count} log.`, desc_en: `Average mood ${avgMood}/5 from ${monthlyMood.count} logs.`, color: avgMood >= 4 ? 'success' : avgMood >= 3 ? 'warning' : 'danger' });
  }

  if (monthlyPomodoro.cycles > 0) {
    insights.push({ icon: '<i data-lucide="award" class="w-5 h-5 text-success-500"></i>', title: `${monthlyPomodoro.cycles} Siklus Pomodoro`, title_en: `${monthlyPomodoro.cycles} Pomodoro Cycles`, description: `Total ${monthlyPomodoro.focus} menit fokus melalui Pomodoro.`, desc_en: `Total ${monthlyPomodoro.focus} focus minutes via Pomodoro.`, color: 'success' });
  }

  if (monthlyQuiz.count > 0) {
    const avgScore = Math.round(monthlyQuiz.avg_score);
    insights.push({ icon: '<i data-lucide="clipboard-list" class="w-5 h-5 text-brand-500"></i>', title: `${monthlyQuiz.count} Quiz Selesai`, title_en: `${monthlyQuiz.count} Quizzes Done`, description: `Rata-rata skor fatigue ${avgScore}%. ${avgScore > 65 ? 'Perhatikan kondisimu.' : 'Kondisi cukup baik.'}`, desc_en: `Average fatigue score ${avgScore}%. ${avgScore > 65 ? 'Pay attention to your condition.' : 'Condition is fairly good.'}`, color: avgScore > 65 ? 'danger' : avgScore > 35 ? 'warning' : 'success' });
  }

  if (isGoogleConnected && monthlyCalendar && monthlyCalendar.days_with_events > 0) {
    const avgBurnout = Math.round(monthlyCalendar.avg_burnout_score);
    const totalMeetings = monthlyCalendar.total_meetings;
    const avgWorkH = Math.round(monthlyCalendar.avg_work_hours * 10) / 10;
    const totalB2B = monthlyCalendar.total_b2b;

    insights.push({ icon: '<i data-lucide="calendar" class="w-5 h-5 text-brand-500"></i>', title: `${totalMeetings} Meeting (${monthlyCalendar.days_with_events} hari)`, title_en: `${totalMeetings} Meetings (${monthlyCalendar.days_with_events} days)`, description: `Rata-rata jadwal ${avgWorkH} jam/hari. ${totalB2B > 0 ? totalB2B + ' meeting back-to-back terdeteksi.' : 'Jarak antar meeting cukup baik.'}`, desc_en: `Average schedule ${avgWorkH} hours/day. ${totalB2B > 0 ? totalB2B + ' back-to-back meetings detected.' : 'Meeting spacing is good.'}`, color: avgBurnout > 65 ? 'danger' : avgBurnout > 35 ? 'warning' : 'success' });

    if (avgBurnout > 65) {
      insights.push({ icon: '<i data-lucide="alert-triangle" class="w-5 h-5 text-danger-500"></i>', title: 'Risiko Burnout Tinggi (Kalender)', title_en: 'High Burnout Risk (Calendar)', description: `Skor burnout kalender ${avgBurnout}%. Jadwalmu terlalu padat, pertimbangkan mengurangi meeting.`, desc_en: `Calendar burnout score ${avgBurnout}%. Your schedule is too packed, consider reducing meetings.`, color: 'danger' });
    } else if (avgBurnout > 35) {
      insights.push({ icon: '<i data-lucide="alert-circle" class="w-5 h-5 text-warning-500"></i>', title: 'Risiko Burnout Sedang (Kalender)', title_en: 'Moderate Burnout Risk (Calendar)', description: `Skor burnout kalender ${avgBurnout}%. Jadwalmu cukup padat. Pastikan ada waktu istirahat.`, desc_en: `Calendar burnout score ${avgBurnout}%. Your schedule is fairly packed. Ensure rest time.`, color: 'warning' });
    }
  }

  if (insights.length === 0) {
    insights.push({ icon: '<i data-lucide="rocket" class="w-5 h-5 text-brand-500"></i>', title: 'Mulai Tracking', title_en: 'Start Tracking', description: 'Belum ada data bulan ini. Mulai log aktivitas, mood, dan ambil quiz!', desc_en: 'No data this month yet. Start logging activities, mood, and take quizzes!', color: 'brand' });
  }

  return insights;
}

module.exports = router;
