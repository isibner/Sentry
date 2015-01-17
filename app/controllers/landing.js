exports.index = function(req, res) {
  if (req.user) {
    return res.redirect('/dashboard');
  } else {
    return res.render('landing');
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
