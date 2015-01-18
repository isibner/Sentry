var github = require('../../config/github');
exports.index = function (req, res, next) {
  return res.render('landing');
};

exports.getUserRepos = function getUserRepos(req, res, next) {
  req.user.findOwnRepos(function (err, repos) {
    if (err) {
      return next(err);
    }
    res.locals.userRepos = repos;
    next();
  })
}

exports.settings = function(req, res) {
  return res.render('settings');
}

exports.login = function(req, res) {
  return res.render('login');
};

exports.logout = function(req, res) {
  req.logout();
  req.flash('success', 'Logged out successfully!');
  return res.redirect('/');
};
