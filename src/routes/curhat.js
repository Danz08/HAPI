const express = require('express');
const { getDb } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /curhat - Render curhat page
router.get('/', (req, res) => {
  const db = getDb();
  const userId = req.session.user.id;

  // Get recent chat history
  const messages = db.prepare(
    'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(userId).reverse();

  // Get latest quiz result for context
  const latestQuiz = db.prepare(
    'SELECT risk_level FROM quiz_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1'
  ).get(userId);

  res.render('pages/curhat', {
    title: 'Curhat - HAPI',
    layout: 'layouts/main',
    messages,
    riskLevel: latestQuiz ? latestQuiz.risk_level : 'Medium',
  });
});

// JSON API endpoints moved to /api/chat/* (see src/routes/api.js)

module.exports = router;
