/**
 * AI Recommendation Engine
 * Generates personalized recommendations based on fatigue score,
 * mood data, and activity patterns.
 */

const recommendationPool = {
  Low: {
    general: [
      {
        title: '✨ Pertahankan Ritme Kerjamu!',
        description: 'Kondisimu saat ini sangat baik. Terus jaga keseimbangan antara kerja dan istirahat.',
        category: 'motivation',
      },
      {
        title: '🎯 Tetap Produktif',
        description: 'Manfaatkan momentum positif ini. Coba selesaikan task yang paling challenging saat energimu masih tinggi.',
        category: 'productivity',
      },
      {
        title: '💪 Challenge Yourself',
        description: 'Saat kondisi mental baik, ini waktu yang tepat untuk belajar skill baru atau mengambil proyek menantang.',
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
        category: 'warning',
      },
      {
        title: '🧘 Istirahat Berkualitas',
        description: 'Cobalah teknik deep breathing 4-7-8: tarik nafas 4 detik, tahan 7 detik, hembuskan 8 detik.',
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
        category: 'critical',
      },
      {
        title: '💤 Prioritaskan Tidur',
        description: 'Pastikan kamu tidur 7-9 jam malam ini. Kurang tidur adalah penyebab utama fatigue kronis.',
        category: 'health',
      },
      {
        title: '🗣️ Jangan Ragu Bercerita',
        description: 'Bicarakan perasaanmu dengan orang terdekat, teman, atau mentor. Kamu tidak harus menanggung semuanya sendiri.',
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
    'Tak apa merasa tidak baik-baik saja. Beri dirimu izin untuk istirahat.',
    'Cobalah journaling — tulis apapun yang kamu rasakan tanpa filter.',
    'Ingat: kondisi ini sementara. Besok adalah hari baru.',
  ],
  2: [ // Bad
    'Coba ubah suasana — pindah ke tempat kerja yang berbeda.',
    'Dengarkan playlist favorit yang biasanya membuatmu semangat.',
    'Lakukan satu hal kecil yang membuatmu senang hari ini.',
  ],
  3: [ // Neutral
    'Mood netral bisa jadi sinyal untuk perubahan kecil yang positif.',
    'Coba sesuatu baru hari ini — meskipun hal sederhana.',
    'Tetapkan satu mini goal yang bisa kamu capai dalam 1 jam.',
  ],
  4: [ // Good
    'Mood bagus! Manfaatkan untuk tackle tugas yang tertunda.',
    'Bagikan energi positifmu — bantu rekan yang mungkin membutuhkan.',
    'Simpan momentum ini dengan menjaga pola makan dan tidur.',
  ],
  5: [ // Great
    'Luar biasa! Kamu sedang di performa terbaik.',
    'Ini waktu yang tepat untuk brainstorming dan kreativitas.',
    'Rayakan pencapaianmu hari ini, sekecil apapun itu!',
  ],
};

/**
 * Generate personalized recommendations
 * @param {string} riskLevel - 'Low', 'Medium', 'High'
 * @param {number} moodScore - 1-5
 * @param {Object} context - Additional context
 * @returns {Object} recommendations
 */
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
    moodTip: selectedMoodTip,
    disclaimer: 'Hasil ini bukan diagnosis medis. Jika kamu merasa membutuhkan bantuan profesional, silakan konsultasikan dengan psikolog atau tenaga kesehatan.',
  };
}

/**
 * Generate AI-style response for curhat
 * @param {string} message - User message
 * @param {string} riskLevel - Current risk level
 * @returns {string} AI response
 */
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
