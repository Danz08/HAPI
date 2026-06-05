const { pool } = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const CRISIS_KEYWORDS = [
  'menyerah', 'ingin hilang', 'tidak mau hidup', 
  'bunuh diri', 'capek hidup', 'tidak sanggup lagi'
];

function detectCrisis(text) {
  const lower = (text || '').toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function processChat(userId, userMessage, emotionData, history = []) {
  // Use heuristic if ML API predicted wrong positive
  if (emotionData && emotionData.emotion) {
    const lowerMsg = (userMessage || '').toLowerCase();
    const positiveWords = ['cerah', 'diterima', 'senang', 'bahagia', 'lulus', 'acc', 'hehe', 'haha', 'bagus', 'baik', 'alhamdulillah', 'puji tuhan', 'berhasil', 'mantap'];
    if (positiveWords.some(w => lowerMsg.includes(w))) {
      emotionData.emotion = 'Senang';
    }
  }

  let isCrisis = detectCrisis(userMessage);
  let chips = [];
  let responses = []; // Array of { text: string, delay: number }

  try {
    const systemPrompt = `Kamu adalah "HAPI Asisten", chatbot empati dan sahabat diskusi untuk mahasiswa pada platform HAPI (Human Activity Pattern Intelligence).
Karakteristik & Aturanmu:
- Sangat empatik, suportif, dan ramah.
- Gunakan bahasa Indonesia sehari-hari yang gaul, santai tapi sopan (seperti "aku", "kamu", "ya", "sih", dll).
- Jangan gunakan formatting markdown tebal/miring berlebihan, buatlah format teks biasa yang nyaman dibaca.
- Jawabanmu harus singkat (1-3 paragraf pendek maksimal) dan tidak terkesan menggurui.
- Fokus pada mendengarkan, memvalidasi perasaan pengguna, dan merespons secara natural layaknya teman cerita.
- Jika pengguna terlihat dalam krisis (sedih mendalam, putus asa), respons dengan sangat hati-hati dan penuh perhatian. HAPI BUKAN PENGGANTI PSIKOLOG PROFESIONAL.
- PENTING: Kamu HANYA boleh membahas hal-hal seputar kesehatan mental, kelelahan (fatigue), produktivitas (pomodoro, aktivitas), curhat emosi/perasaan, atau tentang fitur aplikasi HAPI.
- PENTING: Jika pengguna menanyakan hal di luar topik tersebut (misal: coding, matematika, politik, resep masakan, cuaca, dll), tolak dengan sopan dan ingatkan bahwa kamu adalah HAPI Asisten yang fokus pada kesehatan mental dan produktivitas mereka.
- Konteks emosi pengguna saat ini berdasarkan analisis AI: ${emotionData?.emotion || 'Tidak diketahui'}. Sesuaikan nada bicaramu dengan emosi ini!`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt
    });

    // Format history for Gemini
    // We only take the last 15 messages to save context window and avoid limit errors
    const recentHistory = history.slice(-15);
    
    // Gemini chat format: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // Gemini requires alternating roles and the first message MUST be a user message.
    
    // Instead of filtering out 'START', we replace it with 'Halo' to keep the sequence valid
    let validHistory = recentHistory.map(msg => {
      if (msg.message === 'START') {
        return { ...msg, message: 'Halo' };
      }
      return msg;
    });
    
    // Ensure the first message is from the user
    while (validHistory.length > 0 && validHistory[0].role === 'ai') {
      validHistory.shift();
    }
    
    const formattedHistory = [];
    let lastRole = null;
    
    for (const msg of validHistory) {
      const currentRole = msg.role === 'ai' ? 'model' : 'user';
      // Gemini requires alternating roles, if we have consecutive, we merge them
      if (currentRole === lastRole) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += `\n${msg.message}`;
      } else {
        formattedHistory.push({
          role: currentRole,
          parts: [{ text: msg.message }]
        });
        lastRole = currentRole;
      }
    }
    
    // If the last message in history is user and we are about to add a user message, we might have an issue
    // but the actual userMessage is passed to sendMessage, so the last history role should ideally be 'model'
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      // Just drop the last user message from history, as it might duplicate or break flow
      formattedHistory.pop();
    }

    // Intercept 'START' message
    if (userMessage === 'START') {
      responses.push({ text: "Hei, senang kamu mampir ke sini. 😊", delay: 1200 });
      responses.push({ text: "Ini ruang buat kamu — nggak ada yang dihakimi, nggak ada jawaban yang salah.", delay: 1800 });
      responses.push({ text: "Aku cuma mau tanya satu hal dulu...\n\nKalau hari ini kamu ibaratkan cuaca, kira-kira lagi kayak gimana?", delay: 0 });
      chips = [
        { text: "☀️ Cerah, lumayan oke", value: "Cerah" },
        { text: "🌤️ Agak mendung", value: "Mendung" },
        { text: "🌧️ Hujan deras", value: "Hujan" },
        { text: "⛈️ Badai, berat banget", value: "Badai" }
      ];
      return { responses, chips, isCrisis: false, emotionLabel: null };
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(userMessage);
    const textResponse = result.response.text();

    // Since we removed rule-based delays, we just return one quick response with 0 delay
    responses.push({ text: textResponse, delay: 0 });

  } catch (error) {
    console.error("Gemini API Error:", error);
    responses.push({ text: "Maaf, aku lagi agak pusing nih (sistem error). Bisa coba lagi nanti?", delay: 0 });
  }

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
