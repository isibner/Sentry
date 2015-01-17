var github = require('../../config/github');

exports.index = function (req, res, next) {
  var user = req.user;
  if (req.user) {
    user.findOwnRepos(function (err, data) {
      if (err) {
        return next(err);
      }
      console.log('data', JSON.stringify(Object.keys(data[0])));
      return res.render('landing');
    })
  } else {
    return res.redirect('/login');
  }
};

exports.login = function(req, res) {
  return res.render('login');
};

exports.logout = function(req, res) {
  req.logout();
  req.flash('success', 'Logged out successfully!');
  return res.redirect('/');
};
