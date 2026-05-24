function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Silakan login terlebih dahulu.');
  return res.redirect('/auth/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.user) {
    if (!req.session.user.is_onboarded) {
      return res.redirect('/onboarding');
    }
    return res.redirect('/dashboard');
  }
  return next();
}

function requireOnboarded(req, res, next) {
  if (req.session && req.session.user) {
    if (!req.session.user.is_onboarded) {
      return res.redirect('/onboarding');
    }
    return next();
  }
  return res.redirect('/auth/login');
}

module.exports = { requireAuth, redirectIfAuth, requireOnboarded };
