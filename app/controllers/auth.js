var passport = require('passport');

exports.github = passport.authenticate('github');

exports.noop = function () {};

exports.githubCallback = passport.authenticate('github', { failureRedirect: '/login' });

exports.githubCallbackResolution = function (req, res) {
    res.redirect('/');
};

exports.ensureAuthenticated = function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login')
}
