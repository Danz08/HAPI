const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /pomodoro - Render Pomodoro Timer page
router.get('/', (req, res) => {
  res.render('pages/pomodoro', {
    title: 'Pomodoro Timer - HAPI',
    layout: 'layouts/main',
  });
});

// JSON API endpoints moved to /api/pomodoro/* (see src/routes/api.js)

module.exports = router;
