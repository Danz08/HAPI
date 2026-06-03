
const recommendationPool = {
  Low: {
    general: [
      {
        title: '✨ Pertahankan Ritme Kerjamu!',
        title_en: '✨ Keep Up Your Rhythm!',
        description: 'Kondisimu saat ini sangat baik. Terus jaga keseimbangan antara kerja dan istirahat.',
        description_en: 'Your current condition is very good. Keep maintaining a balance between work and rest.',
        category: 'motivation',
      },
      {
        title: '🎯 Tetap Produktif',
        title_en: '🎯 Stay Productive',
        description: 'Manfaatkan momentum positif ini. Coba selesaikan task yang paling challenging saat energimu masih tinggi.',
        description_en: 'Take advantage of this positive momentum. Try to complete the most challenging tasks while your energy is still high.',
        category: 'productivity',
      },
      {
        title: '💪 Challenge Yourself',
        title_en: '💪 Challenge Yourself',
        description: 'Saat kondisi mental baik, ini waktu yang tepat untuk belajar skill baru atau mengambil proyek menantang.',
        description_en: 'When your mental condition is good, it\'s the perfect time to learn new skills or take on challenging projects.',
        category: 'growth',
      },
    ],
    activities: [
      { id: 'Lanjutkan sesi Pomodoro dengan target 4-6 siklus hari ini', en: 'Continue Pomodoro sessions with a target of 4-6 cycles today' },
      { id: 'Dokumentasikan progress kerjamu — ini membantu tracking pencapaian', en: 'Document your work progress — this helps track achievements' },
      { id: 'Jangan lupa minum air putih minimal 8 gelas per hari', en: 'Do not forget to drink at least 8 glasses of water a day' },
      { id: 'Luangkan 10 menit untuk stretching ringan setiap 2 jam', en: 'Take 10 minutes for light stretching every 2 hours' },
    ],
  },
  Medium: {
    general: [
      {
        title: '⚠️ Waspada Kelelahan',
        title_en: '⚠️ Watch for Fatigue',
        description: 'Tubuhmu mulai menunjukkan tanda-tanda fatigue. Saatnya untuk lebih memperhatikan pola istirahat.',
        description_en: 'Your body is starting to show signs of fatigue. It\'s time to pay more attention to your rest patterns.',
        category: 'warning',
      },
      {
        title: '🧘 Istirahat Berkualitas',
        title_en: '🧘 Quality Rest',
        description: 'Cobalah teknik deep breathing 4-7-8: tarik nafas 4 detik, tahan 7 detik, hembuskan 8 detik.',
        description_en: 'Try the 4-7-8 deep breathing technique: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.',
        category: 'wellness',
      },
      {
        title: '📋 Prioritaskan Tugasmu',
        title_en: '📋 Prioritize Your Tasks',
        description: 'Gunakan metode Eisenhower Matrix — fokus pada yang penting dan mendesak terlebih dahulu.',
        description_en: 'Use the Eisenhower Matrix method — focus on what is important and urgent first.',
        category: 'productivity',
      },
    ],
    activities: [
      { id: 'Kurangi durasi kerja menjadi 20-25 menit per sesi Pomodoro', en: 'Reduce work duration to 20-25 minutes per Pomodoro session' },
      { id: 'Ambil break 10-15 menit setiap selesai 2 sesi kerja', en: 'Take a 10-15 minute break after every 2 work sessions' },
      { id: 'Hindari multitasking — fokus pada satu task di satu waktu', en: 'Avoid multitasking — focus on one task at a time' },
      { id: 'Pertimbangkan untuk jalan kaki ringan 15 menit di luar ruangan', en: 'Consider taking a 15-minute light walk outdoors' },
      { id: 'Batasi konsumsi kafein setelah jam 2 siang', en: 'Limit caffeine consumption after 2 PM' },
      { id: 'Coba dengarkan musik instrumental saat bekerja', en: 'Try listening to instrumental music while working' },
    ],
  },
  High: {
    general: [
      {
        title: '🚨 Tingkat Fatigue Tinggi',
        title_en: '🚨 High Fatigue Level',
        description: 'Kamu perlu segera beristirahat. Fatigue yang berkepanjangan dapat berdampak serius pada kesehatan fisik dan mental.',
        description_en: 'You need to rest immediately. Prolonged fatigue can have a serious impact on your physical and mental health.',
        category: 'critical',
      },
      {
        title: '💤 Prioritaskan Tidur',
        title_en: '💤 Prioritize Sleep',
        description: 'Pastikan kamu tidur 7-9 jam malam ini. Kurang tidur adalah penyebab utama fatigue kronis.',
        description_en: 'Make sure you sleep 7-9 hours tonight. Lack of sleep is the main cause of chronic fatigue.',
        category: 'health',
      },
      {
        title: '🗣️ Jangan Ragu Bercerita',
        title_en: '🗣️ Don\'t Hesitate to Talk',
        description: 'Bicarakan perasaanmu dengan orang terdekat, teman, atau mentor. Kamu tidak harus menanggung semuanya sendiri.',
        description_en: 'Talk about your feelings with those closest to you, friends, or a mentor. You don\'t have to bear it all alone.',
        category: 'social',
      },
    ],
    activities: [
      { id: 'STOP bekerja dan ambil istirahat panjang minimal 30 menit', en: 'STOP working and take a long break of at least 30 minutes' },
      { id: 'Lakukan progressive muscle relaxation untuk melepas ketegangan', en: 'Perform progressive muscle relaxation to release tension' },
      { id: 'Makan makanan bergizi — hindari junk food dan gula berlebih', en: 'Eat nutritious food — avoid junk food and excessive sugar' },
      { id: 'Matikan notifikasi yang tidak penting selama 1 jam', en: 'Turn off non-essential notifications for 1 hour' },
      { id: 'Pertimbangkan untuk tidak lembur hari ini', en: 'Consider not working overtime today' },
      { id: 'Tulis 3 hal yang kamu syukuri hari ini (gratitude journaling)', en: 'Write down 3 things you are grateful for today (gratitude journaling)' },
      { id: 'Jika memungkinkan, ambil power nap 15-20 menit', en: 'If possible, take a 15-20 minute power nap' },
      { id: 'Hubungi teman atau keluarga untuk ngobrol santai', en: 'Contact friends or family for a casual chat' },
    ],
  },
};

const moodBasedTips = {
  1: [ // Very bad
    { id: 'Tak apa merasa tidak baik-baik saja. Beri dirimu izin untuk istirahat.', en: 'It\'s okay to not feel okay. Give yourself permission to rest.' },
    { id: 'Cobalah journaling — tulis apapun yang kamu rasakan tanpa filter.', en: 'Try journaling — write whatever you feel without filters.' },
    { id: 'Ingat: kondisi ini sementara. Besok adalah hari baru.', en: 'Remember: this is temporary. Tomorrow is a new day.' },
  ],
  2: [ // Bad
    { id: 'Coba ubah suasana — pindah ke tempat kerja yang berbeda.', en: 'Try changing the scenery — move to a different workspace.' },
    { id: 'Dengarkan playlist favorit yang biasanya membuatmu semangat.', en: 'Listen to a favorite playlist that usually cheers you up.' },
    { id: 'Lakukan satu hal kecil yang membuatmu senang hari ini.', en: 'Do one small thing that makes you happy today.' },
  ],
  3: [ // Neutral
    { id: 'Mood netral bisa jadi sinyal untuk perubahan kecil yang positif.', en: 'A neutral mood can be a signal for small positive changes.' },
    { id: 'Coba sesuatu baru hari ini — meskipun hal sederhana.', en: 'Try something new today — even a simple thing.' },
    { id: 'Tetapkan satu mini goal yang bisa kamu capai dalam 1 jam.', en: 'Set one mini goal you can achieve in 1 hour.' },
  ],
  4: [ // Good
    { id: 'Mood bagus! Manfaatkan untuk tackle tugas yang tertunda.', en: 'Good mood! Use it to tackle pending tasks.' },
    { id: 'Bagikan energi positifmu — bantu rekan yang mungkin membutuhkan.', en: 'Share your positive energy — help a colleague who might need it.' },
    { id: 'Simpan momentum ini dengan menjaga pola makan dan tidur.', en: 'Keep this momentum by maintaining your diet and sleep.' },
  ],
  5: [ // Great
    { id: 'Luar biasa! Kamu sedang di performa terbaik.', en: 'Amazing! You are at your peak performance.' },
    { id: 'Ini waktu yang tepat untuk brainstorming dan kreativitas.', en: 'This is the perfect time for brainstorming and creativity.' },
    { id: 'Rayakan pencapaianmu hari ini, sekecil apapun itu!', en: 'Celebrate your achievements today, no matter how small!' },
  ],
};

function getRecommendations(riskLevel = 'Low', moodScore = 3, context = {}) {
  const pool = recommendationPool[riskLevel] || recommendationPool.Low;

  // Pick random general recommendations (2 out of available)
  const shuffledGeneral = [...pool.general].sort(() => Math.random() - 0.5);
  const selectedGeneral = shuffledGeneral.slice(0, 2);

  // Pick random activities (3-4 out of available)
  const shuffledActivities = [...pool.activities].sort(() => Math.random() - 0.5);
  const activityCount = riskLevel === 'High' ? 4 : 3;
  const selectedActivities = shuffledActivities.slice(0, activityCount);

  // Get mood-specific tips
  const moodTips = moodBasedTips[moodScore] || moodBasedTips[3];
  const selectedMoodTip = moodTips[Math.floor(Math.random() * moodTips.length)];

  return {
    riskLevel,
    insights: selectedGeneral,
    activities: selectedActivities.map(a => typeof a === 'string' ? a : a.id),
    activities_en: selectedActivities.map(a => typeof a === 'string' ? a : a.en),
    moodTip: selectedMoodTip.id,
    moodTip_en: selectedMoodTip.en,
    disclaimer: 'Hasil ini bukan diagnosis medis. Jika kamu merasa membutuhkan bantuan profesional, silakan konsultasikan dengan psikolog atau tenaga kesehatan.',
  };
}
module.exports = {
  getRecommendations,
  recommendationPool,
};
