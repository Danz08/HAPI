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
    id: 1, dimension: 'emotional_exhaustion',
    text: 'Seberapa sering kamu merasa kehabisan energi di akhir hari kerja/kuliah?',
    text_en: 'How often do you feel drained of energy at the end of a workday?',
    options: [
      { value: 1, label: 'Tidak pernah', label_en: 'Never' },
      { value: 2, label: 'Jarang', label_en: 'Rarely' },
      { value: 3, label: 'Kadang-kadang', label_en: 'Sometimes' },
      { value: 4, label: 'Sering', label_en: 'Often' },
      { value: 5, label: 'Selalu', label_en: 'Always' },
    ],
  },
  {
    id: 2, dimension: 'emotional_exhaustion',
    text: 'Seberapa sering kamu merasa frustrasi dengan pekerjaan/tugas kuliah?',
    text_en: 'How often do you feel frustrated with your work/studies?',
    options: [
      { value: 1, label: 'Tidak pernah', label_en: 'Never' },
      { value: 2, label: 'Jarang', label_en: 'Rarely' },
      { value: 3, label: 'Kadang-kadang', label_en: 'Sometimes' },
      { value: 4, label: 'Sering', label_en: 'Often' },
      { value: 5, label: 'Selalu', label_en: 'Always' },
    ],
  },
  {
    id: 3, dimension: 'emotional_exhaustion',
    text: 'Apakah kamu merasa "terbakar habis" (burned out) oleh rutinitas kerjamu?',
    text_en: 'Do you feel "burned out" by your work routine?',
    options: [
      { value: 1, label: 'Sangat tidak setuju', label_en: 'Strongly disagree' },
      { value: 2, label: 'Tidak setuju', label_en: 'Disagree' },
      { value: 3, label: 'Netral', label_en: 'Neutral' },
      { value: 4, label: 'Setuju', label_en: 'Agree' },
      { value: 5, label: 'Sangat setuju', label_en: 'Strongly agree' },
    ],
  },
  // Depersonalization (4-5)
  {
    id: 4, dimension: 'depersonalization',
    text: 'Seberapa sering kamu merasa tidak peduli dengan hasil pekerjaanmu?',
    text_en: 'How often do you feel indifferent about your work results?',
    options: [
      { value: 1, label: 'Tidak pernah', label_en: 'Never' },
      { value: 2, label: 'Jarang', label_en: 'Rarely' },
      { value: 3, label: 'Kadang-kadang', label_en: 'Sometimes' },
      { value: 4, label: 'Sering', label_en: 'Often' },
      { value: 5, label: 'Selalu', label_en: 'Always' },
    ],
  },
  {
    id: 5, dimension: 'depersonalization',
    text: 'Apakah kamu merasa sulit berkonsentrasi saat bekerja/belajar?',
    text_en: 'Do you find it difficult to concentrate while working/studying?',
    options: [
      { value: 1, label: 'Sangat mudah fokus', label_en: 'Very easy to focus' },
      { value: 2, label: 'Cukup bisa fokus', label_en: 'Can focus well enough' },
      { value: 3, label: 'Kadang terganggu', label_en: 'Sometimes distracted' },
      { value: 4, label: 'Sering kehilangan fokus', label_en: 'Often lose focus' },
      { value: 5, label: 'Sangat sulit fokus', label_en: 'Very hard to focus' },
    ],
  },
  // Personal Accomplishment (6-7)
  {
    id: 6, dimension: 'personal_accomplishment',
    text: 'Seberapa puas kamu dengan pencapaianmu belakangan ini?',
    text_en: 'How satisfied are you with your recent achievements?',
    options: [
      { value: 1, label: 'Sangat tidak puas', label_en: 'Very dissatisfied' },
      { value: 2, label: 'Tidak puas', label_en: 'Dissatisfied' },
      { value: 3, label: 'Biasa saja', label_en: 'Neutral' },
      { value: 4, label: 'Puas', label_en: 'Satisfied' },
      { value: 5, label: 'Sangat puas', label_en: 'Very satisfied' },
    ],
  },
  {
    id: 7, dimension: 'personal_accomplishment',
    text: 'Apakah kamu merasa kontribusimu dihargai oleh orang lain?',
    text_en: 'Do you feel your contributions are valued by others?',
    options: [
      { value: 1, label: 'Sangat tidak dihargai', label_en: 'Not valued at all' },
      { value: 2, label: 'Kurang dihargai', label_en: 'Undervalued' },
      { value: 3, label: 'Biasa saja', label_en: 'Neutral' },
      { value: 4, label: 'Cukup dihargai', label_en: 'Fairly valued' },
      { value: 5, label: 'Sangat dihargai', label_en: 'Highly valued' },
    ],
  },
  // Work Pattern (8-10)
  {
    id: 8, dimension: 'work_pattern',
    text: 'Berapa rata-rata jam kerjamu per hari dalam seminggu terakhir?',
    text_en: 'What is your average daily work hours in the past week?',
    options: [
      { value: 1, label: 'Kurang dari 4 jam', label_en: 'Less than 4 hours' },
      { value: 2, label: '4-6 jam', label_en: '4-6 hours' },
      { value: 3, label: '6-8 jam', label_en: '6-8 hours' },
      { value: 4, label: '8-10 jam', label_en: '8-10 hours' },
      { value: 5, label: 'Lebih dari 10 jam', label_en: 'More than 10 hours' },
    ],
  },
  {
    id: 9, dimension: 'work_pattern',
    text: 'Seberapa sering kamu mengambil jeda istirahat saat bekerja?',
    text_en: 'How often do you take breaks while working?',
    options: [
      { value: 1, label: 'Setiap 30 menit', label_en: 'Every 30 minutes' },
      { value: 2, label: 'Setiap 1 jam', label_en: 'Every 1 hour' },
      { value: 3, label: 'Setiap 2 jam', label_en: 'Every 2 hours' },
      { value: 4, label: 'Jarang istirahat', label_en: 'Rarely take breaks' },
      { value: 5, label: 'Hampir tidak pernah', label_en: 'Almost never' },
    ],
  },
  {
    id: 10, dimension: 'work_pattern',
    text: 'Bagaimana kualitas tidurmu dalam seminggu terakhir?',
    text_en: 'How is your sleep quality in the past week?',
    options: [
      { value: 1, label: 'Sangat baik (7-9 jam)', label_en: 'Very good (7-9 hours)' },
      { value: 2, label: 'Baik (6-7 jam)', label_en: 'Good (6-7 hours)' },
      { value: 3, label: 'Cukup (5-6 jam)', label_en: 'Fair (5-6 hours)' },
      { value: 4, label: 'Kurang (4-5 jam)', label_en: 'Poor (4-5 hours)' },
      { value: 5, label: 'Sangat kurang (<4 jam)', label_en: 'Very poor (<4 hours)' },
    ],
  },
];

// GET /quiz - Render quiz page
router.get('/', (req, res) => {
  res.render('pages/quiz', {
    title: 'Fatigue Quiz - HAPI',
    layout: 'layouts/main',
    pageTitle: 'Quiz Kelelahan',
    pageKey: 'page.quiz',
    questions: quizQuestions,
  });
});

// JSON API endpoints moved to /api/quiz/* (see src/routes/api.js)

module.exports = router;
