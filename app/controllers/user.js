var db = require('../../config/db');
var passport = require('passport');

var User = db.model('User');

exports.login = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: 'Invalid username or password',
  successFlash: 'Logged in successfully!'
});

exports.register = function(req, res, next) {
  req.checkBody('username', 'Invalid username').notEmpty();
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty().len(5);
  req.checkBody('password2', 'Password mismatch').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors[0].msg);
    return res.redirect('/login');
  }

  var user = new User({
    username: req.body.username,
    email: req.body.email
  });

  User.register(user, req.body.password, function(err, user) {
    if (err) return next(err);
    req.login(user, function(err) {
      if (err) return next(err);

      req.flash('success', 'Registered successfully!');
      return res.redirect('/');
    });
  });
};
