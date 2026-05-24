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

module.exports = router;
