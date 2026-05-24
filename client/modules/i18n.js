/**
 * Language Module (i18n)
 * Client-side language toggle with DOM updates and localStorage persistence
 */

export const translations = {
  id: {
    // Sidebar
    'nav.main': 'Menu Utama',
    'nav.monitoring': 'Monitoring',
    'nav.dashboard': 'Dashboard',
    'nav.pomodoro': 'Pomodoro',
    'nav.analytics': 'Analytics',
    'nav.quiz': 'Fatigue Quiz',

    // Navbar
    'btn.mood': 'Mood',
    'btn.theme': 'Ganti Tema',
    'btn.lang': 'Ganti Bahasa',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.fatigue': 'Fatigue Risk Score',
    'dashboard.workDuration': 'Durasi Kerja Hari Ini',
    'dashboard.pomodoroCycles': 'Siklus Pomodoro',
    'dashboard.moodNotFilled': 'Belum diisi',
    'dashboard.activity7days': 'Aktivitas 7 Hari Terakhir',
    'dashboard.moodTrend': 'Tren Mood',
    'dashboard.fatigueBreakdown': 'Breakdown Fatigue',
    'dashboard.quickActions': 'Aksi Cepat',
    'dashboard.startPomodoro': 'Mulai Pomodoro',
    'dashboard.focusMinutes': '25 menit fokus',
    'dashboard.takeQuiz': 'Ambil Quiz',
    'dashboard.checkFatigue': 'Cek fatigue',
    'dashboard.viewAnalytics': 'Lihat kalender & tren',
    'dashboard.recommendations': 'Rekomendasi',
    'dashboard.logActivity': 'Log Aktivitas',
    'dashboard.moodTip': '💡 Mood Tip',

    // Activity form
    'form.work': 'Kerja',
    'form.study': 'Belajar',
    'form.meeting': 'Meeting',
    'form.other': 'Lainnya',
    'form.description': 'Deskripsi...',
    'form.durationMin': 'Durasi (mnt)',
    'form.breakMin': 'Break (mnt)',
    'form.save': 'Simpan',

    // Pomodoro
    'pomo.title': 'Pomodoro Timer',
    'pomo.focus': 'Fokus',
    'pomo.shortBreak': 'Istirahat Singkat',
    'pomo.longBreak': 'Istirahat Panjang',
    'pomo.start': 'Mulai',
    'pomo.pause': 'Jeda',
    'pomo.reset': 'Reset',
    'pomo.cycles': 'Siklus',
    'pomo.focusStat': 'Fokus',
    'pomo.breakStat': 'Istirahat Singkat',
    'pomo.todaySchedule': 'Jadwal Hari Ini',
    'pomo.settings': 'Pengaturan',
    'pomo.focusMin': 'Fokus (menit)',
    'pomo.shortBreakMin': 'Istirahat Singkat (menit)',
    'pomo.longBreakLabel': 'Istirahat Panjang',

    // Analytics
    'analytics.title': 'Activity Analytics',
    'analytics.activeDays': 'Hari Aktif',
    'analytics.totalWork': 'Total Kerja',
    'analytics.avgMood': 'Avg Mood',
    'analytics.streak': 'Streak',

    // Quiz
    'quiz.title': 'Fatigue Quiz',
    'quiz.question': 'Pertanyaan',
    'quiz.of': 'dari',
    'quiz.disclaimer': '⚠️ Hasil quiz ini bukan diagnosis medis. Konsultasikan dengan profesional jika diperlukan.',
    'quiz.result': 'Rekomendasi:',
    'quiz.restart': 'Ulangi Quiz',
    'quiz.lowRisk': 'Risiko Rendah',
    'quiz.medRisk': 'Risiko Sedang',
    'quiz.highRisk': 'Risiko Tinggi',

    // Mood modal
    'mood.title': 'Bagaimana Moodmu?',
    'mood.energy': 'Energi',
    'mood.stress': 'Stres',
    'mood.notes': 'Catatan...',
    'mood.saveMood': 'Simpan Mood',

    // Chatbot
    'chat.name': 'HAPI Buddy',
    'chat.status': 'Selalu ada untukmu',
    'chat.placeholder': 'Ceritakan perasaanmu...',
    'chat.clearConfirm': 'Hapus semua riwayat chat?',

    // General
    'general.loading': 'Memuat...',
    'general.noData': 'Tidak ada data',
    'general.back': 'Kembali ke Beranda',
    'general.logout': 'Keluar',
  },
  en: {
    // Sidebar
    'nav.main': 'Main Menu',
    'nav.monitoring': 'Monitoring',
    'nav.dashboard': 'Dashboard',
    'nav.pomodoro': 'Pomodoro',
    'nav.analytics': 'Analytics',
    'nav.quiz': 'Fatigue Quiz',

    // Navbar
    'btn.mood': 'Mood',
    'btn.theme': 'Toggle Theme',
    'btn.lang': 'Switch Language',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.fatigue': 'Fatigue Risk Score',
    'dashboard.workDuration': 'Work Duration Today',
    'dashboard.pomodoroCycles': 'Pomodoro Cycles',
    'dashboard.moodNotFilled': 'Not filled',
    'dashboard.activity7days': 'Activity (Last 7 Days)',
    'dashboard.moodTrend': 'Mood Trend',
    'dashboard.fatigueBreakdown': 'Fatigue Breakdown',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.startPomodoro': 'Start Pomodoro',
    'dashboard.focusMinutes': '25 minutes focus',
    'dashboard.takeQuiz': 'Take Quiz',
    'dashboard.checkFatigue': 'Check fatigue',
    'dashboard.viewAnalytics': 'View calendar & trends',
    'dashboard.recommendations': 'Recommendations',
    'dashboard.logActivity': 'Log Activity',
    'dashboard.moodTip': '💡 Mood Tip',

    // Activity form
    'form.work': 'Work',
    'form.study': 'Study',
    'form.meeting': 'Meeting',
    'form.other': 'Other',
    'form.description': 'Description...',
    'form.durationMin': 'Duration (min)',
    'form.breakMin': 'Break (min)',
    'form.save': 'Save',

    // Pomodoro
    'pomo.title': 'Pomodoro Timer',
    'pomo.focus': 'Focus',
    'pomo.shortBreak': 'Short Break',
    'pomo.longBreak': 'Long Break',
    'pomo.start': 'Start',
    'pomo.pause': 'Pause',
    'pomo.reset': 'Reset',
    'pomo.cycles': 'Cycles',
    'pomo.focusStat': 'Focus',
    'pomo.breakStat': 'Short Break',
    'pomo.todaySchedule': "Today's Schedule",
    'pomo.settings': 'Settings',
    'pomo.focusMin': 'Focus (min)',
    'pomo.shortBreakMin': 'Short Break (min)',
    'pomo.longBreakLabel': 'Long Break',

    // Analytics
    'analytics.title': 'Activity Analytics',
    'analytics.activeDays': 'Active Days',
    'analytics.totalWork': 'Total Work',
    'analytics.avgMood': 'Avg Mood',
    'analytics.streak': 'Streak',

    // Quiz
    'quiz.title': 'Fatigue Quiz',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.disclaimer': '⚠️ This quiz is not a medical diagnosis. Consult a professional if needed.',
    'quiz.result': 'Recommendations:',
    'quiz.restart': 'Restart Quiz',
    'quiz.lowRisk': 'Low Risk',
    'quiz.medRisk': 'Medium Risk',
    'quiz.highRisk': 'High Risk',

    // Mood modal
    'mood.title': 'How Are You Feeling?',
    'mood.energy': 'Energy',
    'mood.stress': 'Stress',
    'mood.notes': 'Notes...',
    'mood.saveMood': 'Save Mood',

    // Chatbot
    'chat.name': 'HAPI Buddy',
    'chat.status': 'Always here for you',
    'chat.placeholder': 'Tell me how you feel...',
    'chat.clearConfirm': 'Clear all chat history?',

    // General
    'general.loading': 'Loading...',
    'general.noData': 'No data available',
    'general.back': 'Back to Home',
    'general.logout': 'Logout',
  },
};

let currentLang = localStorage.getItem('hapi-lang') || 'id';

export function initLang() {
  const langBtn = document.getElementById('lang-label');
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
  applyTranslations();
}

export function toggleLang() {
  currentLang = currentLang === 'id' ? 'en' : 'id';
  localStorage.setItem('hapi-lang', currentLang);
  const langBtn = document.getElementById('lang-label');
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
  applyTranslations();
}

export function t(key) {
  return translations[currentLang]?.[key] || translations.id[key] || key;
}

export function getLang() {
  return currentLang;
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
function applyTranslations() {
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated && translated !== key) {
      el.textContent = translated;
    }
  });

  // Update all elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated && translated !== key) {
      el.setAttribute('placeholder', translated);
    }
  });

  // Update all elements with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translated = t(key);
    if (translated && translated !== key) {
      el.setAttribute('title', translated);
    }
  });
}
