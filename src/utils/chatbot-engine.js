const { pool } = require('../config/database');

const CRISIS_KEYWORDS = [
  'menyerah', 'ingin hilang', 'tidak mau hidup', 
  'bunuh diri', 'capek hidup', 'tidak sanggup lagi'
];

function detectCrisis(text) {
  const lower = (text || '').toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

// Empathy/OARS dictionaries
const AFFIRMATIONS = [
  "Aku mengerti, ini pasti berat buat kamu.",
  "Wajar banget kalau kamu merasa begitu.",
  "Terima kasih udah mau jujur tentang ini.",
  "Nggak gampang untuk ada di posisi kamu saat ini."
];
function getRandomAffirmation() {
  return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
}

const REFLECTIONS = [
  "Sepertinya kamu sedang menghadapi",
  "Terdengar seperti kamu merasakan",
  "Berarti kamu lagi merasakan",
];
function getReflection(emotion) {
  const key = (emotion || '').toLowerCase();
  const map = {
    'sadness': 'kesedihan yang cukup dalam.',
    'sedih': 'kesedihan yang cukup dalam.',
    
    'anger': 'rasa frustrasi dan marah.',
    'marah': 'rasa frustrasi dan marah.',
    
    'fear': 'rasa cemas dan khawatir.',
    'takut': 'rasa cemas dan khawatir.',
    
    'joy': 'momen yang menyenangkan.',
    'senang': 'momen yang menyenangkan.',
    'happy': 'momen yang menyenangkan.',
    
    'neutral': 'situasi yang cukup campur aduk.',
    'netral': 'situasi yang cukup campur aduk.'
  };
  const feeling = map[key] || 'situasi yang membingungkan.';
  const prefix = REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)];
  return `${prefix} ${feeling}`;
}

const EXPLORATION_QUESTIONS = [
  "Bisa ceritakan lebih banyak soal itu?",
  "Apa yang paling membebani pikiranmu soal ini?",
  "Bagaimana hal ini memengaruhi aktivitas harianmu?",
  "Apa yang biasanya kamu lakuin kalau perasaan ini datang?",
  "Menurutmu, apa yang bisa bikin perasaan ini sedikit lebih baik?"
];

async function getState(userId) {
  const res = await pool.query('SELECT * FROM chatbot_states WHERE user_id = $1', [userId]);
  if (res.rows.length === 0) {
    const defaultState = { current_step: 'OPENING', interactions: 0, context: {} };
    await pool.query(
      'INSERT INTO chatbot_states (user_id, current_step, interactions, context) VALUES ($1, $2, $3, $4)',
      [userId, defaultState.current_step, defaultState.interactions, JSON.stringify(defaultState.context)]
    );
    return defaultState;
  }
  return res.rows[0];
}

async function saveState(userId, state) {
  await pool.query(
    'UPDATE chatbot_states SET current_step = $1, interactions = $2, context = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
    [state.current_step, state.interactions, JSON.stringify(state.context), userId]
  );
}

async function processChat(userId, userMessage, emotionData) {
  // --- FAILSFE OVERRIDE FOR FAULTY ML API ---
  // The external ML API frequently predicts "Sedih" for happy text. 
  // We override it with keyword heuristics here.
  if (emotionData && emotionData.emotion) {
    const lowerMsg = (userMessage || '').toLowerCase();
    const positiveWords = ['cerah', 'diterima', 'senang', 'bahagia', 'lulus', 'acc', 'hehe', 'haha', 'bagus', 'baik', 'alhamdulillah', 'puji tuhan', 'berhasil', 'mantap'];
    if (positiveWords.some(w => lowerMsg.includes(w))) {
      emotionData.emotion = 'Senang';
    }
  }
  // ------------------------------------------

  let state = await getState(userId);
  let responses = []; // Array of { text: string, delay: number }
  let chips = [];
  let isCrisis = detectCrisis(userMessage);

  if (state.current_step === 'OPENING') {
    responses.push({ text: "Hei, senang kamu mampir ke sini. 😊", delay: 1200 });
    responses.push({ text: "Ini ruang buat kamu — nggak ada yang dihakimi, nggak ada jawaban yang salah.", delay: 1800 });
    responses.push({ text: "Aku cuma mau tanya satu hal dulu...\n\nKalau hari ini kamu ibaratkan cuaca, kira-kira lagi kayak gimana?", delay: 0 });
    chips = [
      { text: "☀️ Cerah, lumayan oke", value: "Cerah" },
      { text: "🌤️ Agak mendung", value: "Mendung" },
      { text: "🌧️ Hujan deras", value: "Hujan" },
      { text: "⛈️ Badai, berat banget", value: "Badai" }
    ];
    state.current_step = 'WEATHER_SELECTION';
    
  } else if (state.current_step === 'WEATHER_SELECTION') {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('cerah')) {
      responses.push({ text: "Syukurlah kalau cerah! Senang dengarnya.", delay: 1200 });
      responses.push({ text: "Apa ada hal baik spesifik yang bikin harimu oke?", delay: 0 });
    } else if (lowerMsg.includes('mendung')) {
      responses.push({ text: "Mendung nggak apa-apa. Hebat kamu masih bisa jalan terus.", delay: 1200 });
      responses.push({ text: "Ada pikiran apa yang lagi ngendap di kepala?", delay: 0 });
    } else if (lowerMsg.includes('hujan')) {
      responses.push({ text: "Kedengarannya harimu sangat berat. Aku mengerti rasanya saat semuanya seperti tumpah bersamaan.", delay: 1200 });
      responses.push({ text: "Maukah kamu cerita sedikit soal hujannya?", delay: 0 });
    } else if (lowerMsg.includes('badai')) {
      responses.push({ text: "Ini pasti sangat melelahkan buatmu. Tahan sebentar ya, aku di sini.", delay: 1200 });
      responses.push({ text: "Apa yang paling kerasa berat saat ini?", delay: 0 });
    } else {
      responses.push({ text: "Terima kasih sudah berbagi.", delay: 1200 });
      responses.push({ text: "Boleh cerita lebih lanjut apa yang sedang terjadi?", delay: 0 });
    }
    state.current_step = 'EXPLORATION';
    
  } else if (state.current_step === 'EXPLORATION') {
    state.interactions += 1;
    const emo = emotionData?.emotion || 'neutral';
    
    // OARS method
    let reflection = getReflection(emo);
    let affirmation = getRandomAffirmation();
    let question = EXPLORATION_QUESTIONS[state.interactions % EXPLORATION_QUESTIONS.length];
    
    // Make the static bot slightly more context-aware
    const lowerMsg = userMessage.toLowerCase();
    
    const isPositive = (emo.toLowerCase() === 'senang' || emo.toLowerCase() === 'happy' || emo.toLowerCase() === 'joy');
    
    if (isPositive) {
      // Use positive exploration questions instead of negative OARS
      const POSITIVE_QUESTIONS = [
        "Bagaimana rencanamu untuk merayakan atau menikmati momen ini?",
        "Apa pelajaran paling berharga dari pengalaman baik ini?",
        "Siapa orang pertama yang ingin kamu kasih tahu kabar ini?",
        "Bagaimana perasaan ini membuatmu melihat hari-hari ke depan?"
      ];
      affirmation = "Wah, ikut bahagia dengarnya!";
      question = POSITIVE_QUESTIONS[state.interactions % POSITIVE_QUESTIONS.length];
    } else {
      // Normal negative OARS heuristics
      if (lowerMsg.includes('bagaimana menurut') || lowerMsg.includes('gimana menurut') || lowerMsg.includes('saran')) {
        affirmation = "Aku paham kamu sedang mencari jalan keluar dari situasi ini.";
        reflection = "Terkadang pandangan orang lain memang membantu, tapi di sini aku ingin bantu kamu menemukan jawabanmu sendiri.";
        question = "Kira-kira, langkah kecil apa yang paling realistis untuk kamu coba lebih dulu?";
      } else if (lowerMsg.includes('ingin') || lowerMsg.includes('harap') || lowerMsg.includes('mau')) {
        affirmation = "Itu harapan yang sangat valid.";
        reflection = "Terdengar jelas bahwa hal tersebut sangat penting buat kamu saat ini.";
        question = "Apa yang biasanya menghalangi kamu untuk mencapai hal itu?";
      } else if (lowerMsg.includes('?')) {
        affirmation = "Itu pertanyaan yang bagus untuk direnungkan.";
        reflection = "Seringkali kita merasa kebingungan saat tidak punya jawaban pasti.";
        question = "Kalau kamu coba menebak, menurutmu jawaban apa yang paling masuk akal bagi kondisimu sekarang?";
      }
    }

    if (state.interactions >= 4) {
      responses.push({ text: `Oke, jadi dari yang kamu ceritain tadi...`, delay: 1500 });
      responses.push({ text: `Makasih udah mau cerita hari ini.\nIni udah jadi data yang aku simpan buat bantu ngelihat polamu dari waktu ke waktu.`, delay: 0 });
      chips = [
        { text: "Lihat kondisi aku hari ini", value: "Lihat kondisi" },
        { text: "Mau cerita lagi besok", value: "Cerita besok" },
        { text: "Tutup dulu", value: "Tutup" }
      ];
      state.current_step = 'SUMMARY';
      state.interactions = 0; // reset interactions for next time
    } else {
      responses.push({ text: affirmation, delay: 1200 });
      responses.push({ text: `${reflection} ${question}`, delay: 0 });
    }
    
  } else if (state.current_step === 'SUMMARY') {
    if (userMessage.toLowerCase().includes('kondisi')) {
      responses.push({ text: "Kamu bisa langsung cek halaman Dashboard atau Analytics ya. Di sana semua tren mood dan energimu sudah terekam.", delay: 0 });
    } else {
      responses.push({ text: "Sip, sampai jumpa lagi. Jangan lupa istirahat yang cukup ya! 💙", delay: 0 });
    }
    state.current_step = 'OPENING'; // Reset state for a fresh conversation later
  } else {
    // Failsafe
    responses.push({ text: "Aku di sini untuk mendengarkan. 😊", delay: 0 });
    state.current_step = 'OPENING';
  }

  await saveState(userId, state);

  return {
    responses,
    chips,
    isCrisis,
    emotionLabel: emotionData?.emotion
  };
}

module.exports = {
  processChat,
  detectCrisis
};
