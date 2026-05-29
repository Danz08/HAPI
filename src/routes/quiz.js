const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');

const router = express.Router();
router.use(requireAuth);

// Skala MBI-SS Adaptasi Mahasiswa (0-6)
const mbiOptions = [
  { value: 0, label: 'Tidak Pernah', label_en: 'Never' },
  { value: 1, label: 'Sangat Jarang', label_en: 'Very rarely' },
  { value: 2, label: 'Jarang', label_en: 'Rarely' },
  { value: 3, label: 'Kadang-kadang', label_en: 'Sometimes' },
  { value: 4, label: 'Sering', label_en: 'Often' },
  { value: 5, label: 'Sangat Sering', label_en: 'Very often' },
  { value: 6, label: 'Setiap Hari', label_en: 'Every day' },
];

// Quiz questions based on MBI-SS dimensions
const quizQuestions = [
  // Dimensi Exhaustion (EX1 - EX5)
  {
    id: 1, dimension: 'emotional_exhaustion',
    text: 'Aku merasa kelelahan secara fisik setelah menjalani hari-hari perkuliahan.',
    text_en: 'I feel physically exhausted after going through my college days.',
    options: mbiOptions,
  },
  {
    id: 2, dimension: 'emotional_exhaustion',
    text: 'Aku merasa terkuras secara emosional karena tuntutan akademik yang menumpuk.',
    text_en: 'I feel emotionally drained by the accumulating academic demands.',
    options: mbiOptions,
  },
  {
    id: 3, dimension: 'emotional_exhaustion',
    text: 'Aku bangun pagi tanpa semangat untuk menghadapi aktivitas kuliah hari ini.',
    text_en: 'I wake up in the morning without enthusiasm to face today\'s college activities.',
    options: mbiOptions,
  },
  {
    id: 4, dimension: 'emotional_exhaustion',
    text: 'Mengerjakan tugas dan kegiatan akademik terasa sangat menguras tenagaku.',
    text_en: 'Doing assignments and academic activities feels very draining.',
    options: mbiOptions,
  },
  {
    id: 5, dimension: 'emotional_exhaustion',
    text: 'Aku merasa cemas memikirkan tanggung jawab akademik yang belum terselesaikan.',
    text_en: 'I feel anxious thinking about unresolved academic responsibilities.',
    options: mbiOptions,
  },

  // Dimensi Cynicism (CY1 - CY4)
  {
    id: 6, dimension: 'depersonalization', // setara dengan Cynicism
    text: 'Aku merasa kehilangan antusias terhadap perkuliahan yang sedang aku jalani.',
    text_en: 'I feel I have lost enthusiasm for the studies I am undertaking.',
    options: mbiOptions,
  },
  {
    id: 7, dimension: 'depersonalization',
    text: 'Aku merasa malas dan enggan untuk mengerjakan tugas-tugas akademik.',
    text_en: 'I feel lazy and reluctant to do academic assignments.',
    options: mbiOptions,
  },
  {
    id: 8, dimension: 'depersonalization',
    text: 'Aku meragukan apakah usaha belajarku selama ini benar-benar membawa manfaat.',
    text_en: 'I doubt whether my study efforts so far have really brought benefits.',
    options: mbiOptions,
  },
  {
    id: 9, dimension: 'depersonalization',
    text: 'Aku merasa acuh dan tidak peduli dengan perkembangan akademikku sendiri.',
    text_en: 'I feel indifferent and don\'t care about my own academic progress.',
    options: mbiOptions,
  },

  // Dimensi Academic Efficacy (EF1 - EF6)
  {
    id: 10, dimension: 'personal_accomplishment', // setara dengan Academic Efficacy
    text: 'Aku yakin bisa mengatasi kesulitan akademik yang aku hadapi saat ini.',
    text_en: 'I am confident I can overcome the academic difficulties I am currently facing.',
    options: mbiOptions,
  },
  {
    id: 11, dimension: 'personal_accomplishment',
    text: 'Aku merasa kontribusi dan hasil belajarku memiliki makna yang berarti.',
    text_en: 'I feel my contributions and study results have meaningful significance.',
    options: mbiOptions,
  },
  {
    id: 12, dimension: 'personal_accomplishment',
    text: 'Aku bangga dengan usaha dan pencapaian akademik yang sudah aku raih.',
    text_en: 'I am proud of the effort and academic achievements I have reached.',
    options: mbiOptions,
  },
  {
    id: 13, dimension: 'personal_accomplishment',
    text: 'Aku merasa puas ketika berhasil menyelesaikan tugas atau tantangan akademik.',
    text_en: 'I feel satisfied when I successfully complete an academic task or challenge.',
    options: mbiOptions,
  },
  {
    id: 14, dimension: 'personal_accomplishment',
    text: 'Aku merasa pengetahuan dan kemampuanku terus berkembang selama kuliah.',
    text_en: 'I feel my knowledge and skills continue to develop during college.',
    options: mbiOptions,
  },
  {
    id: 15, dimension: 'personal_accomplishment',
    text: 'Aku percaya diri bahwa aku mampu menyelesaikan studi dengan hasil yang baik.',
    text_en: 'I am confident that I am able to complete my studies with good results.',
    options: mbiOptions,
  }
];

const getLocalToday = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
};

// GET /quiz - Render quiz page
router.get('/', async (req, res) => {
  const db = getDb();
  const today = getLocalToday();
  const userId = req.session.user.id;

  // Check if user already took quiz today
  const todayQuiz = await db.prepare(
    'SELECT * FROM quiz_results WHERE user_id = ? AND date = ? ORDER BY taken_at DESC LIMIT 1'
  ).get(userId, today);

  let todayResult = null;
  if (todayQuiz) {
    const riskColor = getRiskColor(todayQuiz.risk_level);
    let recommendations = {};
    try { recommendations = JSON.parse(todayQuiz.recommendations || '{}'); } catch(e) {}
    todayResult = {
      score: todayQuiz.fatigue_score,
      riskLevel: todayQuiz.risk_level,
      riskColor,
      recommendations,
      taken_at: todayQuiz.taken_at,
    };
  }

  res.render('pages/quiz', {
    title: 'Fatigue Quiz - HAPI',
    layout: 'layouts/main',
    pageTitle: 'Quiz Kelelahan Akademik',
    pageKey: 'page.quiz',
    questions: quizQuestions,
    todayResult,
  });
});

// JSON API endpoints moved to /api/quiz/* (see src/routes/api.js)

module.exports = router;