
const recommendationPool = {
  Low: {
    general: [
      {
        title: '✨ Pertahankan Ritme Kerjamu!',
        description: 'Kondisimu saat ini sangat baik. Terus jaga keseimbangan antara kerja dan istirahat.',
        description_en: 'Your current condition is very good. Keep maintaining a balance between work and rest.',
        category: 'motivation',
      },
      {
        title: '🎯 Tetap Produktif',
        description: 'Manfaatkan momentum positif ini. Coba selesaikan task yang paling challenging saat energimu masih tinggi.',
        description_en: 'Take advantage of this positive momentum. Try to complete the most challenging tasks while your energy is still high.',
        category: 'productivity',
      },
      {
        title: '💪 Challenge Yourself',
        description: 'Saat kondisi mental baik, ini waktu yang tepat untuk belajar skill baru atau mengambil proyek menantang.',
        description_en: 'When your mental condition is good, it\'s the perfect time to learn new skills or take on challenging projects.',
        category: 'growth',
      },
    ],
    activities: [
      'Lanjutkan sesi Pomodoro dengan target 4-6 siklus hari ini',
      'Dokumentasikan progress kerjamu — ini membantu tracking pencapaian',
      'Jangan lupa minum air putih minimal 8 gelas per hari',
      'Luangkan 10 menit untuk stretching ringan setiap 2 jam',
    ],
  },
  Medium: {
    general: [
      {
        title: '⚠️ Waspada Kelelahan',
        description: 'Tubuhmu mulai menunjukkan tanda-tanda fatigue. Saatnya untuk lebih memperhatikan pola istirahat.',
        description_en: 'Your body is starting to show signs of fatigue. It\'s time to pay more attention to your rest patterns.',
        category: 'warning',
      },
      {
        title: '🧘 Istirahat Berkualitas',
        description: 'Cobalah teknik deep breathing 4-7-8: tarik nafas 4 detik, tahan 7 detik, hembuskan 8 detik.',
        description_en: 'Try the 4-7-8 deep breathing technique: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.',
        category: 'wellness',
      },
      {
        title: '📋 Prioritaskan Tugasmu',
        description: 'Gunakan metode Eisenhower Matrix — fokus pada yang penting dan mendesak terlebih dahulu.',
        category: 'productivity',
      },
    ],
    activities: [
      'Kurangi durasi kerja menjadi 20-25 menit per sesi Pomodoro',
      'Ambil break 10-15 menit setiap selesai 2 sesi kerja',
      'Hindari multitasking — fokus pada satu task di satu waktu',
      'Pertimbangkan untuk jalan kaki ringan 15 menit di luar ruangan',
      'Batasi konsumsi kafein setelah jam 2 siang',
      'Coba dengarkan musik instrumental saat bekerja',
    ],
  },
  High: {
    general: [
      {
        title: '🚨 Tingkat Fatigue Tinggi',
        description: 'Kamu perlu segera beristirahat. Fatigue yang berkepanjangan dapat berdampak serius pada kesehatan fisik dan mental.',
        description_en: 'You need to rest immediately. Prolonged fatigue can have a serious impact on your physical and mental health.',
        category: 'critical',
      },
      {
        title: '💤 Prioritaskan Tidur',
        description: 'Pastikan kamu tidur 7-9 jam malam ini. Kurang tidur adalah penyebab utama fatigue kronis.',
        description_en: 'Make sure you sleep 7-9 hours tonight. Lack of sleep is the main cause of chronic fatigue.',
        category: 'health',
      },
      {
        title: '🗣️ Jangan Ragu Bercerita',
        description: 'Bicarakan perasaanmu dengan orang terdekat, teman, atau mentor. Kamu tidak harus menanggung semuanya sendiri.',
        description_en: 'Talk about your feelings with those closest to you, friends, or a mentor. You don\'t have to bear it all alone.',
        category: 'social',
      },
    ],
    activities: [
      'STOP bekerja dan ambil istirahat panjang minimal 30 menit',
      'Lakukan progressive muscle relaxation untuk melepas ketegangan',
      'Makan makanan bergizi — hindari junk food dan gula berlebih',
      'Matikan notifikasi yang tidak penting selama 1 jam',
      'Pertimbangkan untuk tidak lembur hari ini',
      'Tulis 3 hal yang kamu syukuri hari ini (gratitude journaling)',
      'Jika memungkinkan, ambil power nap 15-20 menit',
      'Hubungi teman atau keluarga untuk ngobrol santai',
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
    activities: selectedActivities,
    moodTip: selectedMoodTip.id,
    moodTip_en: selectedMoodTip.en,
    disclaimer: 'Hasil ini bukan diagnosis medis. Jika kamu merasa membutuhkan bantuan profesional, silakan konsultasikan dengan psikolog atau tenaga kesehatan.',
  };
}

function generateCurhatResponse(message, riskLevel = 'Medium') {
  const lowerMsg = message.toLowerCase();

  // Keyword-based empathetic responses
  const responses = {
    stress: [
      'Aku mengerti kamu sedang merasa tertekan. Stres adalah reaksi alami tubuh, tapi penting untuk mengelolanya. Coba tarik nafas dalam 3 kali, dan ceritakan lebih lanjut apa yang membuatmu stres?',
      'Merasa stres itu wajar, terutama saat beban kerja menumpuk. Yang penting adalah mengenali batasmu. Apakah ada tugas spesifik yang membuatmu overwhelmed?',
    ],
    capek: [
      'Capek setelah bekerja keras itu normal. Tapi kalau rasa capek tidak hilang setelah istirahat, itu bisa jadi tanda fatigue yang perlu diperhatikan. Sudah berapa lama kamu merasa seperti ini?',
      'Tubuhmu sedang memberi sinyal untuk istirahat. Jangan abaikan ya! Coba istirahat 15-20 menit dulu, dan pastikan kamu cukup minum air.',
    ],
    lelah: [
      'Kelelahan yang berkepanjangan bisa berdampak pada kesehatan fisik dan mentalmu. Apakah kamu sudah tidur cukup belakangan ini?',
      'Aku dengar kamu, dan perasaanmu valid. Kelelahan bisa datang dari banyak faktor — fisik, mental, atau emosional. Mari kita cari tahu bersama apa yang bisa membantumu.',
    ],
    senang: [
      'Senang mendengar kamu dalam mood yang baik! 😊 Manfaatkan energi positif ini untuk hal-hal produktif. Apa yang membuatmu senang hari ini?',
      'Mood positif seperti ini sangat berharga! Coba catat apa yang membuatmu merasa baik, supaya bisa kamu ulangi di lain waktu.',
    ],
    malas: [
      'Rasa malas kadang datang karena otak kita butuh stimulasi baru. Coba mulai dari task yang paling kecil dan mudah dulu — kadang momentum datang setelah langkah pertama.',
      'Semua orang pernah merasa malas. Yang membedakan adalah bagaimana kita meresponsnya. Coba teknik "2-minute rule" — kerjakan sesuatu selama 2 menit saja, dan lihat apakah kamu ingin melanjutkan.',
    ],
    sedih: [
      'Perasaan sedih itu valid dan kamu berhak merasakannya. Tidak perlu terburu-buru untuk "baik-baik saja". Ceritakan apa yang membuatmu sedih?',
      'Aku di sini untukmu. Kesedihan adalah bagian dari menjadi manusia. Yang penting, jangan simpan sendiri ya. Bagikan apa yang kamu rasakan.',
    ],
    deadline: [
      'Deadline memang bisa sangat menekan. Coba breakdown tugas besar menjadi bagian-bagian kecil, lalu selesaikan satu per satu. Kamu pasti bisa!',
      'Saat dikejar deadline, prioritaskan yang paling penting. Gunakan Pomodoro timer untuk menjaga fokus — 25 menit kerja, 5 menit istirahat.',
    ],
  };

  // Find matching response
  for (const [keyword, responseList] of Object.entries(responses)) {
    if (lowerMsg.includes(keyword)) {
      return responseList[Math.floor(Math.random() * responseList.length)];
    }
  }

  // Default empathetic responses based on risk level
  const defaults = {
    Low: 'Terima kasih sudah berbagi! Sepertinya kamu dalam kondisi yang cukup baik. Tetap jaga pola kerja dan istirahatmu ya. Ada hal lain yang ingin kamu ceritakan?',
    Medium: 'Terima kasih sudah bercerita. Aku memperhatikan tingkat fatigue-mu sedang di level sedang. Penting untuk tetap waspada dan menjaga keseimbangan. Apa yang bisa kubantu?',
    High: 'Aku mendengarmu, dan aku apresiasi kamu mau bercerita. Berdasarkan kondisimu saat ini, sepertinya kamu perlu istirahat yang cukup. Ingat, kesehatanmu lebih penting dari apapun. Mau cerita lebih lanjut?',
  };

  return defaults[riskLevel] || defaults.Medium;
}

module.exports = {
  getRecommendations,
  generateCurhatResponse,
  recommendationPool,
};
