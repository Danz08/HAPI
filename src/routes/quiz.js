const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { getRiskColor } = require('../utils/fatigue-calculator');
const { getRecommendations } = require('../utils/recommendations');

const router = express.Router();
router.use(requireAuth);

// Quiz questions based on MBI dimensions
const quizQuestions = [
  // Emotional Exhaustion (1-3)
  {
    id: 1,
    dimension: 'emotional_exhaustion',
    text: 'Seberapa sering kamu merasa kehabisan energi di akhir hari kerja/kuliah?',
    options: [
      { value: 1, label: 'Tidak pernah' },
      { value: 2, label: 'Jarang' },
      { value: 3, label: 'Kadang-kadang' },
      { value: 4, label: 'Sering' },
      { value: 5, label: 'Selalu' },
    ],
  },
  {
    id: 2,
    dimension: 'emotional_exhaustion',
    text: 'Seberapa sering kamu merasa frustrasi dengan pekerjaan/tugas kuliah?',
    options: [
      { value: 1, label: 'Tidak pernah' },
      { value: 2, label: 'Jarang' },
      { value: 3, label: 'Kadang-kadang' },
      { value: 4, label: 'Sering' },
      { value: 5, label: 'Selalu' },
    ],
  },
  {
    id: 3,
    dimension: 'emotional_exhaustion',
    text: 'Apakah kamu merasa "terbakar habis" (burned out) oleh rutinitas kerjamu?',
    options: [
      { value: 1, label: 'Sangat tidak setuju' },
      { value: 2, label: 'Tidak setuju' },
      { value: 3, label: 'Netral' },
      { value: 4, label: 'Setuju' },
      { value: 5, label: 'Sangat setuju' },
    ],
  },
  // Depersonalization (4-5)
  {
    id: 4,
    dimension: 'depersonalization',
    text: 'Seberapa sering kamu merasa tidak peduli dengan hasil pekerjaanmu?',
    options: [
      { value: 1, label: 'Tidak pernah' },
      { value: 2, label: 'Jarang' },
      { value: 3, label: 'Kadang-kadang' },
      { value: 4, label: 'Sering' },
      { value: 5, label: 'Selalu' },
    ],
  },
  {
    id: 5,
    dimension: 'depersonalization',
    text: 'Apakah kamu merasa sulit berkonsentrasi saat bekerja/belajar?',
    options: [
      { value: 1, label: 'Sangat mudah fokus' },
      { value: 2, label: 'Cukup bisa fokus' },
      { value: 3, label: 'Kadang terganggu' },
      { value: 4, label: 'Sering kehilangan fokus' },
      { value: 5, label: 'Sangat sulit fokus' },
    ],
  },
  // Personal Accomplishment (6-7) — inverse scoring
  {
    id: 6,
    dimension: 'personal_accomplishment',
    text: 'Seberapa puas kamu dengan pencapaianmu belakangan ini?',
    options: [
      { value: 1, label: 'Sangat tidak puas' },
      { value: 2, label: 'Tidak puas' },
      { value: 3, label: 'Biasa saja' },
      { value: 4, label: 'Puas' },
      { value: 5, label: 'Sangat puas' },
    ],
  },
  {
    id: 7,
    dimension: 'personal_accomplishment',
    text: 'Apakah kamu merasa kontribusimu dihargai oleh orang lain?',
    options: [
      { value: 1, label: 'Sangat tidak dihargai' },
      { value: 2, label: 'Kurang dihargai' },
      { value: 3, label: 'Biasa saja' },
      { value: 4, label: 'Cukup dihargai' },
      { value: 5, label: 'Sangat dihargai' },
    ],
  },
  // Work Pattern (8-10)
  {
    id: 8,
    dimension: 'work_pattern',
    text: 'Berapa rata-rata jam kerjamu per hari dalam seminggu terakhir?',
    options: [
      { value: 1, label: 'Kurang dari 4 jam' },
      { value: 2, label: '4-6 jam' },
      { value: 3, label: '6-8 jam' },
      { value: 4, label: '8-10 jam' },
      { value: 5, label: 'Lebih dari 10 jam' },
    ],
  },
  {
    id: 9,
    dimension: 'work_pattern',
    text: 'Seberapa sering kamu mengambil jeda istirahat saat bekerja?',
    options: [
      { value: 1, label: 'Setiap 30 menit' },
      { value: 2, label: 'Setiap 1 jam' },
      { value: 3, label: 'Setiap 2 jam' },
      { value: 4, label: 'Jarang istirahat' },
      { value: 5, label: 'Hampir tidak pernah' },
    ],
  },
  {
    id: 10,
    dimension: 'work_pattern',
    text: 'Bagaimana kualitas tidurmu dalam seminggu terakhir?',
    options: [
      { value: 1, label: 'Sangat baik (7-9 jam)' },
      { value: 2, label: 'Baik (6-7 jam)' },
      { value: 3, label: 'Cukup (5-6 jam)' },
      { value: 4, label: 'Kurang (4-5 jam)' },
      { value: 5, label: 'Sangat kurang (<4 jam)' },
    ],
  },
];

// GET /quiz - Render quiz page
router.get('/', (req, res) => {
  res.render('pages/quiz', {
    title: 'Fatigue Quiz - HAPI',
    layout: 'layouts/main',
    questions: quizQuestions,
  });
});

// JSON API endpoints moved to /api/quiz/* (see src/routes/api.js)

module.exports = router;
