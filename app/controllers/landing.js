var GithubAPI = require('github');

var github = new GithubAPI({
  version: '3.0.0',

  debug: true,
  protocol: 'https',
  //host: '', // not sure about this one
  parthPrefix: '/api/v3', // for some GHEs
  timeout: 5000,
  headers: {
    'user-agent': 'Github-Todo-App',
  }
});

exports.index = function(req, res) {
  var user = req.user;
  if (req.user) {
    github.authenticate({
      type: 'oauth',
      token: user.accessToken
    });
     msg = {
      user: 'FabioFleitas',
      repo: 'todo',
      title: 'Test Issue',
      body: 'Wow such body much oauth @FabioFleitas',
      labels: ['cubans'],
    }
    github.issues.create(msg, function () {
      res.render('landing');
    });
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
