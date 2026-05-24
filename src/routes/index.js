const express = require('express');
const router = express.Router();

// Landing page
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('pages/landing', {
    title: 'HAPI - Human Activity Pattern Intelligence',
    layout: 'layouts/main',
  });
});

// Onboarding page
router.get('/onboarding', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.is_onboarded === 1) {
    return res.redirect('/dashboard');
  }
  res.render('pages/onboarding', {
    title: 'Welcome to HAPI - Onboarding',
    layout: 'layouts/main',
  });
});

module.exports = router;
