var passport = require('passport');

exports.github = passport.authenticate('github', {scope: 'repo, admin:repo_hook'});

exports.noop = function () {};

exports.githubCallback = passport.authenticate('github', {
  failureRedirect: '/login',
  scope: 'repo, admin:repo_hook'
});

exports.githubCallbackResolution = function (req, res) {
    res.redirect('/');
};

exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
