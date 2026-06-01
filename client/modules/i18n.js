// Modul bahasa (ID/EN) — toggle dan apply ke DOM

export const translations = {
  id: {
    // Sidebar
    'nav.main': 'Menu Utama',
    'nav.dashboard': 'Dashboard',
    'nav.pomodoro': 'Pomodoro',
    'nav.analytics': 'Analitik',
    'nav.quiz': 'Quiz Kelelahan',

    // Navbar
    'btn.mood': 'Catat Mood',
    'btn.theme': 'Ganti Tema',
    'btn.lang': 'Bahasa',

    // Dashboard
    'dashboard.greeting': 'Selamat datang kembali',
    'dashboard.subtitle': 'Berikut rangkuman metrik kelelahan dan aktivitasmu hari ini.',
    'dashboard.currentRisk': 'Skor Risiko Saat Ini',
    'dashboard.fatigueTrend': 'Tren Kelelahan 7 Hari',
    'dashboard.detailedView': 'Lihat Detail',
    'dashboard.todayActivity': 'Aktivitas Hari Ini',
    'dashboard.pomodoroSessions': 'Sesi Pomodoro',
    'dashboard.quizzesTaken': 'Quiz Diambil',
    'dashboard.insights': 'Wawasan',
    'dashboard.moodHistory': 'Riwayat Mood',
    'dashboard.noMoodYet': 'Belum ada catatan mood.',
    'dashboard.startWriting': 'Mulai catat',
    'dashboard.fatigueBreakdown': 'Rincian Kelelahan',
    'dashboard.logActivity': 'Catat Aktivitas',
    'dashboard.fatigueRiskLow': 'Tingkat kelelahanmu masih dalam batas wajar. Pertahankan ritme baikmu!',
    'dashboard.fatigueRiskMed': 'Kelelahanmu mulai meningkat. Pertimbangkan istirahat singkat.',
    'dashboard.fatigueRiskHigh': 'Tingkat kelelahanmu tinggi. Segera istirahat dan kurangi beban kerja.',
    'dashboard.lastUpdated': 'Terakhir diperbarui: Hari ini',
    'dashboard.setReminder': 'Atur Pengingat',
    'dashboard.chatStart': 'Mulai Obrolan',
    'dashboard.disclaimer': 'HAPI dirancang untuk memberikan wawasan seputar kelelahan. Ini bukan pengganti saran medis profesional.',
    'dashboard.lastRange': '7 Hari Terakhir',
    'dashboard.range14': '14 Hari Terakhir',
    'dashboard.range30': '30 Hari Terakhir',
    'dashboard.weekWork': 'Kerja Minggu Ini',
    'dashboard.todayWork': 'Kerja Hari Ini',
    'dashboard.sessions': 'sesi',
    'dashboard.minutes': 'menit',
    'dashboard.hours': 'jam',
    'dashboard.noActivity': 'Belum ada aktivitas hari ini.',
    'dashboard.quizWarningTitle': 'Quiz Belum Diisi!',
    'dashboard.quizWarningDesc': 'Kamu belum mengisi quiz hari ini. Streakmu terancam padam jika tidak diisi sebelum berganti hari!',
    'dashboard.fillQuizNow': 'Isi Quiz Sekarang',

    // Activity form
    'form.work': 'Kerja',
    'form.study': 'Belajar',
    'form.meeting': 'Rapat',
    'form.other': 'Lainnya',
    'form.description': 'Deskripsi kegiatan...',
    'form.durationMin': 'Durasi (mnt)',
    'form.breakMin': 'Istirahat (mnt)',
    'form.save': 'Simpan',

    // Breakdown
    'breakdown.quiz': 'Quiz',
    'breakdown.mood': 'Mood',
    'breakdown.workload': 'Beban Kerja',
    'breakdown.breaks': 'Istirahat',

    // Pomodoro
    'pomo.title': 'Timer Pomodoro',
    'pomo.focus': 'Fokus',
    'pomo.shortBreak': 'Istirahat Singkat',
    'pomo.longBreak': 'Istirahat Panjang',
    'pomo.start': 'Mulai',
    'pomo.pause': 'Jeda',
    'pomo.resume': 'Lanjutkan',
    'pomo.reset': 'Ulang',
    'pomo.cycles': 'Siklus',
    'pomo.focusStat': 'Fokus',
    'pomo.breakStat': 'Istirahat',
    'pomo.todaySchedule': 'Jadwal Hari Ini',
    'pomo.settings': 'Pengaturan Timer',
    'pomo.focusMin': 'Durasi Fokus (menit)',
    'pomo.shortBreakMin': 'Istirahat Singkat (menit)',
    'pomo.longBreakLabel': 'Istirahat Panjang (menit)',
    'pomo.sessionComplete': 'Sesi selesai! Waktunya istirahat.',
    'pomo.breakComplete': 'Istirahat selesai! Siap fokus kembali?',
    'pomo.noSchedule': 'Tidak ada jadwal hari ini',
    'pomo.loadFail': 'Gagal memuat jadwal',
    'pomo.now': 'SEKARANG',
    'pomo.timerStarted': 'Timer dimulai',

    // Analytics
    'analytics.title': 'Analitik Aktivitas',
    'analytics.activeDays': 'Hari Aktif',
    'analytics.totalWork': 'Total Kerja',
    'analytics.avgMood': 'Rata-rata Mood',
    'analytics.streak': 'Streak Harian',
    'analytics.heatmap': 'Kalender Aktivitas',
    'analytics.moodTrend': 'Tren Mood',
    'analytics.workTrend': 'Tren Kerja',
    'analytics.insights': 'Insight Bulanan',
    'analytics.noData': 'Belum ada data untuk bulan ini.',
    'analytics.clickDay': 'Klik tanggal di kalender untuk melihat detail aktivitas',
    'analytics.connectGoogle': 'Hubungkan Google Calendar',
    'analytics.syncCalendar': 'Sinkronkan Kalender',

    // Quiz
    'quiz.alreadyDoneTitle': 'Quiz Hari Ini Sudah Selesai',
    'quiz.alreadyDoneDesc': 'Kamu sudah mengisi quiz kelelahan hari ini. Berikut hasil terakhirmu:',
    'quiz.alreadyDoneFooter': 'Quiz dapat diisi kembali besok. Hasil ini berlaku untuk hari ini.',
    'quiz.descLow': 'Tingkat kelelahan akademikmu masih rendah. Pertahankan ritme belajarmu!',
    'quiz.descMedium': 'Kamu menunjukkan tanda-tanda kelelahan sedang. Perhatikan pola istirahat.',
    'quiz.descHigh': 'Tingkat kelelahanmu tinggi. Segera ambil langkah untuk beristirahat.',
    'quiz.title': 'Quiz Kelelahan',
    'quiz.subtitle': 'Ukur tingkat kelelahan berdasarkan pola kerjamu',
    'quiz.question': 'Pertanyaan',
    'quiz.of': 'dari',
    'quiz.prev': 'Sebelumnya',
    'quiz.next': 'Berikutnya',
    'quiz.submit': 'Lihat Hasil',
    'quiz.disclaimer': 'Hasil quiz ini bukan diagnosis medis. Konsultasikan dengan profesional kesehatan jika diperlukan.',
    'quiz.result': 'Rekomendasi:',
    'quiz.restart': 'Ulangi Quiz',
    'quiz.lowRisk': 'Risiko Rendah',
    'quiz.medRisk': 'Risiko Sedang',
    'quiz.highRisk': 'Risiko Tinggi',
    'quiz.yourScore': 'Skormu',
    'quiz.activities': 'Saran Aktivitas',
    'quiz.dimEmotional': 'Kelelahan Emosional',
    'quiz.dimDepersonalization': 'Depersonalisasi',
    'quiz.dimAccomplishment': 'Pencapaian Personal',
    'quiz.dimWorkPattern': 'Pola Kerja',
    'quiz.error': 'Terjadi Kesalahan',
    
    // Missing Quiz
    'quiz.analyzing': 'Menganalisis jawabanmu...',
    'quiz.dimensionBreakdown': 'Rincian Per Dimensi',
    'quiz.exhaustion': 'Kelelahan (Exhaustion)',
    'quiz.exhaustionDesc': 'Tingkat kelelahan fisik & emosional',
    'quiz.cynicism': 'Sinisme (Cynicism)',
    'quiz.cynicismDesc': 'Sikap negatif terhadap studi',
    'quiz.efficacy': 'Efikasi Akademik',
    'quiz.efficacyDesc': 'Keyakinan terhadap kemampuan akademik',
    'quiz.recommendations': 'Rekomendasi',
    'quiz.toDashboard': 'Dashboard',
    'quiz.toAnalytics': 'Lihat Analitik',
    'quiz.swal.streakTitle': '🔥 Streak Aktif!',
    'quiz.swal.streakDays': 'Hari Berturut-turut!',
    'quiz.swal.streakDesc': 'Hebat! Konsistensimu mengisi quiz sangat baik. Terus pertahankan!',
    'quiz.swal.streakConfirm': 'Lanjutkan 💪',

    // Dashboard Swal
    'dashboard.swal.quizTitle': 'Jangan lupa isi Quiz hari ini!',
    'dashboard.swal.quizText': 'Isi quiz sekarang untuk melihat tingkat kelelahanmu dan menjaga streak tetap menyala!',
    'dashboard.swal.quizConfirm': 'Mulai Quiz',
    'dashboard.swal.later': 'Nanti Saja',
    'dashboard.swal.moodTitle': 'Bagaimana perasaanmu hari ini?',
    'dashboard.swal.moodText': 'Kamu belum mencatat mood hari ini. Catat sekarang untuk menjaga streakmu!',
    'dashboard.swal.moodConfirm': 'Catat Mood Sekarang',

    // Mood
    'mood.title': 'Bagaimana Perasaanmu?',
    'mood.subtitle': 'Catat moodmu saat ini',
    'mood.energy': 'Energi',
    'mood.stress': 'Stres',
    'mood.notes': 'Catatan',
    'mood.notesOptional': '(opsional)',
    'mood.notesPlaceholder': 'Apa yang mempengaruhi moodmu hari ini?',
    'mood.saveMood': 'Simpan Mood',
    'mood.low': 'Rendah',
    'mood.high': 'Tinggi',
    'mood.veryBad': 'Sangat Buruk',
    'mood.bad': 'Buruk',
    'mood.okay': 'Biasa',
    'mood.good': 'Baik',
    'mood.great': 'Sangat Baik',
    'mood.saved': 'Mood berhasil disimpan!',
    'mood.selectFirst': 'Pilih mood terlebih dahulu.',
    'mood.saveFail': 'Gagal menyimpan mood.',
    'mood.trackingHelp': 'Tracking mood membantumu memahami pola emosimu',

    // Chatbot
    'chat.name': 'HAPI Asisten',
    'chat.status': 'Siap membantumu',
    'chat.placeholder': 'Ketik pesanmu di sini...',
    'chat.welcome': 'Halo! Aku HAPI Asisten. Ceritakan apa yang kamu rasakan, atau tanyakan apa saja seputar produktivitas dan kesehatanmu.',
    'chat.clearConfirm': 'Hapus semua riwayat percakapan?',
    'chat.clear': 'Hapus Chat',
    'chat.close': 'Tutup',
    'chat.send': 'Kirim',
    'chat.quick.stress': 'Aku merasa stres',
    'chat.quick.tired': 'Aku merasa lelah',
    'chat.quick.sad': 'Aku merasa sedih',
    'chat.quick.happy': 'Aku merasa senang',
    'chat.quick.focus': 'Tips fokus belajar',
    'chat.thinking': 'HAPI sedang mengetik...',
    'chat.error': 'Maaf, terjadi kesalahan. Coba lagi ya.',
    'chat.cleared': 'Percakapan telah dibersihkan.',

    // General
    'general.loading': 'Memuat...',
    'general.noData': 'Belum ada data',
    'general.back': 'Kembali ke Beranda',
    'general.logout': 'Keluar',
    'general.save': 'Simpan',
    'general.cancel': 'Batal',
    'general.close': 'Tutup',
    'general.today': 'Hari ini',
    'general.yesterday': 'Kemarin',
    'general.hour': 'jam',
    'general.minute': 'menit',

    // Landing Page
    'landing.nav.login': 'Masuk',
    'landing.nav.register': 'Mulai Sekarang',
    'landing.hero.badge': 'AI-Powered Fatigue Monitoring',
    'landing.hero.title1': 'Cara yang lebih tenang',
    'landing.hero.title2': 'untuk ',
    'landing.hero.title3': 'bekerja',
    'landing.hero.title4': ' dan ',
    'landing.hero.title5': 'beristirahat.',
    'landing.hero.subtitle': 'HAPI adalah teman pintar yang memantau kelelahanmu, mengelola mood, dan menjaga produktivitasmu tetap seimbang \u2014 semua didukung oleh kecerdasan buatan.',
    'landing.hero.cta': 'Mulai Sekarang',
    'landing.hero.learnMore': 'Pelajari Lebih Lanjut',
    'landing.hero.trust1': 'Bukan Diagnosis Medis',
    'landing.hero.trust2': 'Data Aman & Privat',
    'landing.hero.trust3': 'Open Source',
    'landing.feat.title1': 'Kecerdasan untuk ',
    'landing.feat.title2': 'ritme harianmu',
    'landing.feat.subtitle': 'Lebih dari sekadar manajemen waktu \u2014 HAPI memahami kondisimu secara menyeluruh.',
    'landing.feat1.title': 'Smart Pomodoro Timer',
    'landing.feat1.desc': 'Timer Pomodoro cerdas yang terintegrasi dengan Google Calendar. Durasi fokus dan istirahat tercatat otomatis.',
    'landing.feat2.title': 'AI Chatbot Asisten',
    'landing.feat2.desc': 'Chatbot AI empatik yang selalu siap mendengarkan. Ceritakan perasaanmu kapan saja.',
    'landing.feat3.title': 'Fatigue Risk Scoring',
    'landing.feat3.desc': 'Algoritma AI menganalisis pola kerjamu, hasil quiz MBI, mood harian, dan data kalender untuk skor risiko yang akurat.',
    'landing.step.title1': 'Langkah sederhana menuju ',
    'landing.step.title2': 'keseimbangan',
    'landing.step.subtitle': 'Mulai pantau kesehatan mentalmu dalam 4 langkah mudah.',
    'landing.step1.title': 'Daftar Akun',
    'landing.step1.desc': 'Buat akun atau masuk dengan Google dalam hitungan detik.',
    'landing.step2.title': 'Isi Quiz & Log Mood',
    'landing.step2.desc': 'Jawab 10 pertanyaan fatigue dan catat moodmu setiap hari.',
    'landing.step3.title': 'Gunakan Pomodoro',
    'landing.step3.desc': 'Kerja dengan teknik Pomodoro yang terintegrasi kalender.',
    'landing.step4.title': 'Lihat Insight',
    'landing.step4.desc': 'Dapatkan analisis, tren, dan rekomendasi personal dari AI.',
    'landing.sci.badge': 'Berbasis Riset',
    'landing.sci.title1': 'Basis Ilmiah & ',
    'landing.sci.title2': 'Komunitas',
    'landing.sci.desc': 'HAPI menggunakan Maslach Burnout Inventory (MBI) \u2014 instrumen psikometri paling banyak digunakan di dunia untuk mengukur burnout.',
    'landing.cta.title1': 'Siap menemukan ',
    'landing.cta.title2': 'keseimbanganmu?',
    'landing.cta.desc': 'Bergabunglah dengan para profesional yang membangun hubungan sehat dengan pekerjaan mereka.',
    'landing.cta.btn': 'Mulai Perjalananmu',
    'landing.disclaimer': 'HAPI adalah alat monitoring dan self-assessment, bukan pengganti diagnosis medis profesional. Jika kamu mengalami gejala fatigue atau burnout yang berat, silakan konsultasikan dengan psikolog atau tenaga kesehatan profesional.',
    'landing.sci.methodology': 'Pelajari Metodologi Kami',
    'landing.footer.desc': 'Human Activity Pattern Intelligence \u2014 Monitor kelelahan, kelola mood, dan tingkatkan produktivitasmu dengan AI.',

    // Auth Pages
    'auth.backHome': 'Kembali ke Beranda',
    'auth.login.title': 'Selamat Datang Kembali',
    'auth.login.subtitle': 'Masuk ke akunmu untuk melanjutkan',
    'auth.login.google': 'Masuk dengan Google',
    'auth.login.divider': 'atau masuk dengan email',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Masuk',
    'auth.login.noAccount': 'Belum punya akun?',
    'auth.login.register': 'Daftar Sekarang',
    'auth.register.title': 'Buat Akun Baru',
    'auth.register.subtitle': 'Mulai perjalanan monitoring fatigue-mu',
    'auth.register.google': 'Daftar dengan Google',
    'auth.register.divider': 'atau daftar dengan email',
    'auth.register.name': 'Nama Lengkap',
    'auth.register.username': 'Username',
    'auth.register.email': 'Email',
    'auth.register.password': 'Password',
    'auth.register.confirmPassword': 'Konfirmasi Password',
    'auth.register.submit': 'Buat Akun',
    'auth.register.hasAccount': 'Sudah punya akun?',
    'auth.register.login': 'Masuk di sini',

    // Page Titles (topbar)
    'page.dashboard': 'Dashboard',
    'page.pomodoro': 'Pomodoro',
    'page.analytics': 'Analitik',
    'page.quiz': 'Quiz Kelelahan',

    // Dashboard Mood History
    'dashboard.energy': 'Energi',
    'dashboard.stress': 'Stres',

    // Mood Scores
    'mood.1': 'Sangat Buruk',
    'mood.2': 'Buruk',
    'mood.3': 'Biasa',
    'mood.4': 'Baik',
    'mood.5': 'Sangat Baik',

    // Onboarding
    'onboarding.slide1.title': 'Welcome to HAPI',
    'onboarding.slide1.desc': 'HAPI (Human Activity Pattern Intelligence) adalah teman pintar yang memantau kelelahanmu, mengelola mood, dan menjaga produktivitasmu tetap seimbang.',
    'onboarding.slide2.title': 'Kenali Dashboard-mu',
    'onboarding.slide2.desc': 'Pusat kendali harianmu. Lihat skor risikomu saat ini, tren kelelahan selama 7 hari terakhir, dan wawasan AI yang disesuaikan dengan kondisimu.',
    'onboarding.slide3.title': 'Pomodoro Pintar',
    'onboarding.slide3.desc': 'Bukan sekadar timer biasa. HAPI merekomendasikan waktu fokus dan istirahat yang ideal berdasarkan tingkat kelelahan dan mood aslimu hari ini.',
    'onboarding.slide4.title': 'Analitik Mendalam',
    'onboarding.slide4.desc': 'Pantau riwayat aktivitasmu melalui kalender interaktif. Hubungkan kalender Google-mu untuk melihat korelasi antara jadwal rapat dan risiko burnout.',
    'onboarding.slide5.title': 'Quiz Kelelahan',
    'onboarding.slide5.desc': 'Kunci utama HAPI. Isi kuesioner singkat setiap hari agar AI dapat mengukur tingkat kelelahanmu dan memberikan rekomendasi terbaik.',
    'onboarding.prev': 'Sebelumnya',
    'onboarding.next': 'Selanjutnya',
    'onboarding.start': 'Mulai Quiz Pertamamu',
    'onboarding.note': 'Kamu akan diarahkan untuk mengisi Quiz Fatigue awal.',
    'onboarding.loading': 'Memproses...',

    // Analytics
    'analytics.activeDays': 'Hari Aktif',
    'analytics.totalWork': 'Total Kerja',
    'analytics.pomodoroCycles': 'Siklus Pomodoro',
    'analytics.avgMood': 'Avg Mood',
    'analytics.streak': 'Streak Hari',
    'analytics.calendar': 'Kalender Aktivitas',
    'analytics.day.Min': 'Min',
    'analytics.day.Sen': 'Sen',
    'analytics.day.Sel': 'Sel',
    'analytics.day.Rab': 'Rab',
    'analytics.day.Kam': 'Kam',
    'analytics.day.Jum': 'Jum',
    'analytics.day.Sab': 'Sab',
    'analytics.legend.intensity': 'Intensitas:',
    'analytics.legend.none': 'Tidak ada',
    'analytics.legend.low': 'Rendah',
    'analytics.legend.med': 'Sedang',
    'analytics.legend.high': 'Tinggi',
    'analytics.legend.max': 'Maksimal',
    'analytics.detailTitle': 'Detail Hari',
    'analytics.detailEmpty': 'Klik tanggal di kalender untuk melihat detail aktivitas',
    'analytics.insights': 'Insights',
    'analytics.workActivity': 'Aktivitas Kerja',
    'analytics.moodTrend': 'Tren Mood',
    'analytics.activityBreakdown': 'Breakdown Aktivitas',
    'analytics.googleConnected': 'Terhubung',
    'analytics.googleConnect': 'Hubungkan Google Calendar',
    'analytics.googleDesc': 'Analisis jadwalmu secara otomatis untuk mendeteksi risiko burnout berdasarkan jumlah meeting, durasi kerja, dan meeting back-to-back.',
    'analytics.googleFeature1': 'Read-only access',
    'analytics.googleFeature2': 'Data tetap privat',
    'analytics.googleFeature3': 'Bisa diputuskan kapan saja',
    'analytics.totalMeeting': 'Total Meeting',
    'analytics.avgDuration': 'Avg Durasi/Hari',
    'analytics.b2b': 'Back-to-Back',
    'analytics.calBurnout': 'Calendar Burnout Score',
    'analytics.noCalData': 'Belum ada data kalender untuk bulan ini. Klik sync untuk memperbarui.',
    'analytics.detail.loading': 'Memuat...',
    'analytics.detail.activities': 'Aktivitas',
    'analytics.detail.work': 'kerja',
    'analytics.detail.break': 'istirahat',
    'analytics.detail.workType': 'Kerja',
    'analytics.detail.studyType': 'Belajar',
    'analytics.detail.otherType': 'Lain',
    'analytics.detail.cycles': 'siklus',
    'analytics.detail.focus': 'fokus',
    'analytics.detail.score': 'Skor',
    'analytics.detail.riskLow': 'Rendah',
    'analytics.detail.riskMed': 'Sedang',
    'analytics.detail.riskHigh': 'Tinggi',
    'analytics.detail.allDay': 'Sepanjang hari',
    'analytics.detail.meeting': 'meeting',
    'analytics.detail.empty': 'Tidak ada data untuk hari ini',
    'analytics.detail.error': 'Gagal memuat data',
  },

  en: {
    // Sidebar
    'nav.main': 'Main Menu',
    'nav.dashboard': 'Dashboard',
    'nav.pomodoro': 'Pomodoro',
    'nav.analytics': 'Analytics',
    'nav.quiz': 'Fatigue Quiz',

    // Navbar
    'btn.mood': 'Log Mood',
    'btn.theme': 'Toggle Theme',
    'btn.lang': 'Language',

    // Dashboard
    'dashboard.greeting': 'Welcome back',
    'dashboard.subtitle': 'Here is a summary of your fatigue metrics and activities today.',
    'dashboard.currentRisk': 'Current Risk Score',
    'dashboard.fatigueTrend': '7-Day Fatigue Trend',
    'dashboard.detailedView': 'View Details',
    'dashboard.todayActivity': "Today's Activity",
    'dashboard.pomodoroSessions': 'Pomodoro Sessions',
    'dashboard.quizzesTaken': 'Quizzes Taken',
    'dashboard.insights': 'Insights',
    'dashboard.moodHistory': 'Mood History',
    'dashboard.noMoodYet': 'No mood logged yet.',
    'dashboard.startWriting': 'Start logging',
    'dashboard.fatigueBreakdown': 'Fatigue Breakdown',
    'dashboard.logActivity': 'Log Activity',
    'dashboard.fatigueRiskLow': 'Your fatigue level is within a safe range. Keep up the good rhythm!',
    'dashboard.fatigueRiskMed': 'Your fatigue is increasing. Consider taking a short break.',
    'dashboard.fatigueRiskHigh': 'Your fatigue level is high. Rest immediately and reduce workload.',
    'dashboard.lastUpdated': 'Last updated: Today',
    'dashboard.setReminder': 'Set Reminder',
    'dashboard.chatStart': 'Start Chat',
    'dashboard.disclaimer': 'HAPI is designed to provide fatigue insights. It is not a substitute for professional medical advice.',
    'dashboard.lastRange': 'Last 7 Days',
    'dashboard.range14': 'Last 14 Days',
    'dashboard.range30': 'Last 30 Days',
    'dashboard.weekWork': 'This Week Work',
    'dashboard.todayWork': "Today's Work",
    'dashboard.sessions': 'sessions',
    'dashboard.minutes': 'minutes',
    'dashboard.hours': 'hours',
    'dashboard.noActivity': 'No activity today yet.',
    'dashboard.quizWarningTitle': 'Quiz Not Completed!',
    'dashboard.quizWarningDesc': 'You haven\'t completed the quiz today. Your streak is at risk of being lost if not completed before tomorrow!',
    'dashboard.fillQuizNow': 'Take Quiz Now',

    // Activity form
    'form.work': 'Work',
    'form.study': 'Study',
    'form.meeting': 'Meeting',
    'form.other': 'Other',
    'form.description': 'Activity description...',
    'form.durationMin': 'Duration (min)',
    'form.breakMin': 'Break (min)',
    'form.save': 'Save',

    // Breakdown
    'breakdown.quiz': 'Quiz',
    'breakdown.mood': 'Mood',
    'breakdown.workload': 'Workload',
    'breakdown.breaks': 'Breaks',

    // Pomodoro
    'pomo.title': 'Pomodoro Timer',
    'pomo.focus': 'Focus',
    'pomo.shortBreak': 'Short Break',
    'pomo.longBreak': 'Long Break',
    'pomo.start': 'Start',
    'pomo.pause': 'Pause',
    'pomo.resume': 'Resume',
    'pomo.reset': 'Reset',
    'pomo.cycles': 'Cycles',
    'pomo.focusStat': 'Focus',
    'pomo.breakStat': 'Break',
    'pomo.todaySchedule': "Today's Schedule",
    'pomo.settings': 'Timer Settings',
    'pomo.focusMin': 'Focus Duration (min)',
    'pomo.shortBreakMin': 'Short Break (min)',
    'pomo.longBreakLabel': 'Long Break (min)',
    'pomo.sessionComplete': 'Session complete! Time for a break.',
    'pomo.breakComplete': 'Break over! Ready to focus?',
    'pomo.noSchedule': 'No schedule for today',
    'pomo.loadFail': 'Failed to load schedule',
    'pomo.now': 'NOW',
    'pomo.timerStarted': 'Timer started',

    // Analytics
    'analytics.title': 'Activity Analytics',
    'analytics.activeDays': 'Active Days',
    'analytics.totalWork': 'Total Work',
    'analytics.avgMood': 'Average Mood',
    'analytics.streak': 'Daily Streak',
    'analytics.heatmap': 'Activity Calendar',
    'analytics.moodTrend': 'Mood Trend',
    'analytics.workTrend': 'Work Trend',
    'analytics.insights': 'Monthly Insights',
    'analytics.noData': 'No data for this month yet.',
    'analytics.clickDay': 'Click a date on the calendar to see activity details',
    'analytics.connectGoogle': 'Connect Google Calendar',
    'analytics.syncCalendar': 'Sync Calendar',

    // Quiz
    'quiz.alreadyDoneTitle': 'Today\'s Quiz Completed',
    'quiz.alreadyDoneDesc': 'You have already taken the fatigue quiz today. Here is your latest result:',
    'quiz.alreadyDoneFooter': 'The quiz can be retaken tomorrow. This result is valid for today.',
    'quiz.descLow': 'Your academic fatigue level is low. Keep up your learning rhythm!',
    'quiz.descMedium': 'You are showing signs of moderate fatigue. Pay attention to your rest patterns.',
    'quiz.descHigh': 'Your fatigue level is high. Take steps to rest immediately.',
    'quiz.title': 'Fatigue Quiz',
    'quiz.subtitle': 'Measure your fatigue level based on work patterns',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.prev': 'Previous',
    'quiz.next': 'Next',
    'quiz.submit': 'See Results',
    'quiz.disclaimer': 'This quiz is not a medical diagnosis. Consult a healthcare professional if needed.',
    'quiz.result': 'Recommendations:',
    'quiz.restart': 'Retake Quiz',
    'quiz.lowRisk': 'Low Risk',
    'quiz.medRisk': 'Medium Risk',
    'quiz.highRisk': 'High Risk',
    'quiz.yourScore': 'Your Score',
    'quiz.activities': 'Suggested Activities',
    'quiz.dimEmotional': 'Emotional Exhaustion',
    'quiz.dimDepersonalization': 'Depersonalization',
    'quiz.dimAccomplishment': 'Personal Accomplishment',
    'quiz.dimWorkPattern': 'Work Pattern',
    'quiz.error': 'An Error Occurred',

    // Missing Quiz
    'quiz.analyzing': 'Analyzing your answers...',
    'quiz.dimensionBreakdown': 'Dimension Breakdown',
    'quiz.exhaustion': 'Exhaustion',
    'quiz.exhaustionDesc': 'Physical & emotional fatigue level',
    'quiz.cynicism': 'Cynicism',
    'quiz.cynicismDesc': 'Negative attitude towards studies',
    'quiz.efficacy': 'Academic Efficacy',
    'quiz.efficacyDesc': 'Belief in academic abilities',
    'quiz.recommendations': 'Recommendations',
    'quiz.toDashboard': 'Dashboard',
    'quiz.toAnalytics': 'View Analytics',
    'quiz.swal.streakTitle': '🔥 Streak Active!',
    'quiz.swal.streakDays': 'Consecutive Days!',
    'quiz.swal.streakDesc': 'Great! Your consistency in taking the quiz is excellent. Keep it up!',
    'quiz.swal.streakConfirm': 'Continue 💪',

    // Dashboard Swal
    'dashboard.swal.quizTitle': 'Don\'t forget to take today\'s Quiz!',
    'dashboard.swal.quizText': 'Take the quiz now to see your fatigue level and keep your streak alive!',
    'dashboard.swal.quizConfirm': 'Start Quiz',
    'dashboard.swal.later': 'Later',
    'dashboard.swal.moodTitle': 'How are you feeling today?',
    'dashboard.swal.moodText': 'You haven\'t logged your mood today. Log it now to keep your streak!',
    'dashboard.swal.moodConfirm': 'Log Mood Now',

    // Mood
    'mood.title': 'How Are You Feeling?',
    'mood.subtitle': 'Log your current mood',
    'mood.energy': 'Energy',
    'mood.stress': 'Stress',
    'mood.notes': 'Notes',
    'mood.notesOptional': '(optional)',
    'mood.notesPlaceholder': "What's affecting your mood today?",
    'mood.saveMood': 'Save Mood',
    'mood.low': 'Low',
    'mood.high': 'High',
    'mood.veryBad': 'Very Bad',
    'mood.bad': 'Bad',
    'mood.okay': 'Okay',
    'mood.good': 'Good',
    'mood.great': 'Great',
    'mood.saved': 'Mood saved successfully!',
    'mood.selectFirst': 'Please select a mood first.',
    'mood.saveFail': 'Failed to save mood.',
    'mood.trackingHelp': 'Tracking mood helps you understand your emotional patterns',

    // Chatbot
    'chat.name': 'HAPI Assistant',
    'chat.status': 'Ready to help',
    'chat.placeholder': 'Type your message here...',
    'chat.welcome': "Hi! I'm HAPI Assistant. Tell me how you're feeling, or ask me anything about productivity and well-being.",
    'chat.clearConfirm': 'Clear all conversation history?',
    'chat.clear': 'Clear Chat',
    'chat.close': 'Close',
    'chat.send': 'Send',
    'chat.quick.stress': "I'm feeling stressed",
    'chat.quick.tired': "I'm feeling tired",
    'chat.quick.sad': "I'm feeling sad",
    'chat.quick.happy': "I'm feeling happy",
    'chat.quick.focus': 'Focus tips for studying',
    'chat.thinking': 'HAPI is typing...',
    'chat.error': 'Sorry, something went wrong. Please try again.',
    'chat.cleared': 'Conversation cleared.',

    // General
    'general.loading': 'Loading...',
    'general.noData': 'No data yet',
    'general.back': 'Back to Home',
    'general.logout': 'Logout',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.close': 'Close',
    'general.today': 'Today',
    'general.yesterday': 'Yesterday',
    'general.hour': 'hour',
    'general.minute': 'minute',

    // Landing Page
    'landing.nav.login': 'Log In',
    'landing.nav.register': 'Get Started',
    'landing.hero.badge': 'AI-Powered Fatigue Monitoring',
    'landing.hero.title1': 'A calmer way',
    'landing.hero.title2': 'to ',
    'landing.hero.title3': 'work',
    'landing.hero.title4': ' and ',
    'landing.hero.title5': 'rest.',
    'landing.hero.subtitle': 'HAPI is a smart companion that monitors your fatigue, manages your mood, and keeps your productivity balanced \u2014 all powered by AI.',
    'landing.hero.cta': 'Get Started Now',
    'landing.hero.learnMore': 'Learn More',
    'landing.hero.trust1': 'Not a Medical Diagnosis',
    'landing.hero.trust2': 'Secure & Private Data',
    'landing.hero.trust3': 'Open Source',
    'landing.feat.title1': 'Intelligence for your ',
    'landing.feat.title2': 'daily rhythm',
    'landing.feat.subtitle': 'More than just time management \u2014 HAPI understands your condition thoroughly.',
    'landing.feat1.title': 'Smart Pomodoro Timer',
    'landing.feat1.desc': 'Smart Pomodoro timer integrated with Google Calendar. Focus and break durations are automatically recorded.',
    'landing.feat2.title': 'AI Chatbot Assistant',
    'landing.feat2.desc': 'An empathetic AI chatbot always ready to listen. Share your feelings anytime.',
    'landing.feat3.title': 'Fatigue Risk Scoring',
    'landing.feat3.desc': 'AI algorithms analyze your work patterns, MBI quiz results, daily mood, and calendar data for accurate risk scores.',
    'landing.step.title1': 'A simple path to ',
    'landing.step.title2': 'balance',
    'landing.step.subtitle': 'Start tracking your mental well-being in 4 easy steps.',
    'landing.step1.title': 'Create Account',
    'landing.step1.desc': 'Sign up or log in with Google in seconds.',
    'landing.step2.title': 'Take Quiz & Log Mood',
    'landing.step2.desc': 'Answer 10 fatigue questions and log your mood daily.',
    'landing.step3.title': 'Use Pomodoro',
    'landing.step3.desc': 'Work using the Pomodoro technique integrated with your calendar.',
    'landing.step4.title': 'View Insights',
    'landing.step4.desc': 'Get personalized analysis, trends, and recommendations from AI.',
    'landing.sci.badge': 'Research Based',
    'landing.sci.title1': 'Scientific Basis & ',
    'landing.sci.title2': 'Community',
    'landing.sci.desc': 'HAPI uses the Maslach Burnout Inventory (MBI) \u2014 the most widely used psychometric instrument worldwide to measure burnout.',
    'landing.cta.title1': 'Ready to find your ',
    'landing.cta.title2': 'balance?',
    'landing.cta.desc': 'Join professionals building a healthier relationship with their work.',
    'landing.cta.btn': 'Start Your Journey',
    'landing.disclaimer': 'HAPI is a self-assessment and monitoring tool, not a substitute for professional medical diagnosis. If you experience severe fatigue or burnout symptoms, please consult a psychologist or healthcare professional.',
    'landing.sci.methodology': 'Learn Our Methodology',
    'landing.footer.desc': 'Human Activity Pattern Intelligence \u2014 Monitor fatigue, manage mood, and boost your productivity with AI.',

    // Auth Pages
    'auth.backHome': 'Back to Home',
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to your account to continue',
    'auth.login.google': 'Sign in with Google',
    'auth.login.divider': 'or sign in with email',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign In',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.register': 'Register Now',
    'auth.register.title': 'Create New Account',
    'auth.register.subtitle': 'Start your fatigue monitoring journey',
    'auth.register.google': 'Sign up with Google',
    'auth.register.divider': 'or sign up with email',
    'auth.register.name': 'Full Name',
    'auth.register.username': 'Username',
    'auth.register.email': 'Email',
    'auth.register.password': 'Password',
    'auth.register.confirmPassword': 'Confirm Password',
    'auth.register.submit': 'Create Account',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.login': 'Sign in here',

    // Page Titles (topbar)
    'page.dashboard': 'Dashboard',
    'page.pomodoro': 'Pomodoro',
    'page.analytics': 'Analytics',
    'page.quiz': 'Fatigue Quiz',

    // Dashboard Mood History
    'dashboard.energy': 'Energy',
    'dashboard.stress': 'Stress',

    // Mood Scores
    'mood.1': 'Very Bad',
    'mood.2': 'Bad',
    'mood.3': 'Neutral',
    'mood.4': 'Good',
    'mood.5': 'Very Good',

    // Onboarding
    'onboarding.slide1.title': 'Welcome to HAPI',
    'onboarding.slide1.desc': 'HAPI (Human Activity Pattern Intelligence) is your smart companion that monitors fatigue, manages mood, and keeps your productivity balanced.',
    'onboarding.slide2.title': 'Meet Your Dashboard',
    'onboarding.slide2.desc': 'Your daily command center. See your current risk score, 7-day fatigue trend, and AI insights tailored to your condition.',
    'onboarding.slide3.title': 'Smart Pomodoro',
    'onboarding.slide3.desc': 'Not just a regular timer. HAPI recommends ideal focus and rest intervals based on your actual fatigue and mood today.',
    'onboarding.slide4.title': 'Deep Analytics',
    'onboarding.slide4.desc': 'Track your activity history through an interactive calendar. Connect your Google Calendar to see correlations between meetings and burnout risk.',
    'onboarding.slide5.title': 'Fatigue Quiz',
    'onboarding.slide5.desc': 'The core of HAPI. Complete a short questionnaire daily so the AI can measure your fatigue and give the best recommendations.',
    'onboarding.prev': 'Previous',
    'onboarding.next': 'Next',
    'onboarding.start': 'Start Your First Quiz',
    'onboarding.note': 'You will be redirected to complete the initial Fatigue Quiz.',
    'onboarding.loading': 'Processing...',

    // Analytics
    'analytics.activeDays': 'Active Days',
    'analytics.totalWork': 'Total Work',
    'analytics.pomodoroCycles': 'Pomodoro Cycles',
    'analytics.avgMood': 'Avg Mood',
    'analytics.streak': 'Day Streak',
    'analytics.calendar': 'Activity Calendar',
    'analytics.day.Min': 'Sun',
    'analytics.day.Sen': 'Mon',
    'analytics.day.Sel': 'Tue',
    'analytics.day.Rab': 'Wed',
    'analytics.day.Kam': 'Thu',
    'analytics.day.Jum': 'Fri',
    'analytics.day.Sab': 'Sat',
    'analytics.legend.intensity': 'Intensity:',
    'analytics.legend.none': 'None',
    'analytics.legend.low': 'Low',
    'analytics.legend.med': 'Med',
    'analytics.legend.high': 'High',
    'analytics.legend.max': 'Max',
    'analytics.detailTitle': 'Day Detail',
    'analytics.detailEmpty': 'Click a date on the calendar to see activity details',
    'analytics.insights': 'Insights',
    'analytics.workActivity': 'Work Activity',
    'analytics.moodTrend': 'Mood Trend',
    'analytics.activityBreakdown': 'Activity Breakdown',
    'analytics.googleConnected': 'Connected',
    'analytics.googleConnect': 'Connect Google Calendar',
    'analytics.googleDesc': 'Automatically analyze your schedule to detect burnout risk based on meetings, work duration, and back-to-back meetings.',
    'analytics.googleFeature1': 'Read-only access',
    'analytics.googleFeature2': 'Private data',
    'analytics.googleFeature3': 'Disconnect anytime',
    'analytics.totalMeeting': 'Total Meetings',
    'analytics.avgDuration': 'Avg Duration/Day',
    'analytics.b2b': 'Back-to-Back',
    'analytics.calBurnout': 'Calendar Burnout Score',
    'analytics.noCalData': 'No calendar data for this month yet. Click sync to update.',
    'analytics.detail.loading': 'Loading...',
    'analytics.detail.activities': 'Activities',
    'analytics.detail.work': 'work',
    'analytics.detail.break': 'break',
    'analytics.detail.workType': 'Work',
    'analytics.detail.studyType': 'Study',
    'analytics.detail.otherType': 'Other',
    'analytics.detail.cycles': 'cycles',
    'analytics.detail.focus': 'focus',
    'analytics.detail.score': 'Score',
    'analytics.detail.riskLow': 'Low',
    'analytics.detail.riskMed': 'Med',
    'analytics.detail.riskHigh': 'High',
    'analytics.detail.allDay': 'All day',
    'analytics.detail.meeting': 'meetings',
    'analytics.detail.empty': 'No data for today',
    'analytics.detail.error': 'Failed to load data',
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

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = translations[currentLang]?.[key];
    if (val) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = translations[currentLang]?.[key];
    if (val) el.setAttribute('placeholder', val);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = translations[currentLang]?.[key];
    if (val) el.setAttribute('title', val);
  });

  // Translate analytics insights
  const lang = currentLang === 'en' ? 'en' : 'id';
  document.querySelectorAll('.insight-title').forEach(el => {
    let titleText = el.getAttribute(`data-title-${lang}`);
    
    // Robust fallback for legacy DB records that are missing title_en
    if (lang === 'en' && titleText) {
      const fallbackMap = {
        '✨ Pertahankan Ritme Kerjamu!': '✨ Keep Up Your Rhythm!',
        '🎯 Tetap Produktif': '🎯 Stay Productive',
        '💪 Challenge Yourself': '💪 Challenge Yourself',
        '⚠️ Waspada Kelelahan': '⚠️ Watch for Fatigue',
        '🧘 Istirahat Berkualitas': '🧘 Quality Rest',
        '📋 Prioritaskan Tugasmu': '📋 Prioritize Your Tasks',
        '🚨 Tingkat Fatigue Tinggi': '🚨 High Fatigue Level',
        '💤 Prioritaskan Tidur': '💤 Prioritize Sleep',
        '🗣️ Jangan Ragu Bercerita': '🗣️ Don\'t Hesitate to Talk'
      };
      
      // Try exact match first
      if (fallbackMap[titleText]) {
        titleText = fallbackMap[titleText];
      } else {
        // Fallback for slight emoji or spacing variations in old DB records
        const clean = titleText.replace(/^[^\w\s]+\s*/u, '').trim();
        if (clean === 'Pertahankan Ritme Kerjamu!') titleText = '✨ Keep Up Your Rhythm!';
        else if (clean === 'Tetap Produktif') titleText = '🎯 Stay Productive';
        else if (clean === 'Challenge Yourself') titleText = '💪 Challenge Yourself';
        else if (clean === 'Waspada Kelelahan') titleText = '⚠️ Watch for Fatigue';
        else if (clean === 'Istirahat Berkualitas') titleText = '🧘 Quality Rest';
        else if (clean === 'Prioritaskan Tugasmu') titleText = '📋 Prioritize Your Tasks';
        else if (clean === 'Tingkat Fatigue Tinggi') titleText = '🚨 High Fatigue Level';
        else if (clean === 'Prioritaskan Tidur') titleText = '💤 Prioritize Sleep';
        else if (clean === 'Jangan Ragu Bercerita') titleText = '🗣️ Don\'t Hesitate to Talk';
      }
    }

    const span = el.querySelector('span');
    if (span && titleText) span.textContent = titleText;
  });
  document.querySelectorAll('.insight-desc').forEach(el => {
    const descText = el.getAttribute(`data-desc-${lang}`);
    if (descText) el.textContent = descText;
  });

  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: currentLang } }));
}
