var github = require('../../config/github');
var config = require('../../config/config');

var apiDone = function (res, next) {
  return function (err) {
    if (err) {
      return next(err);
    }
    res.send({success: true});
  };
};

exports.addRepo = function (req, res, next) {
  var done = apiDone(res, next);
  var user = req.user;
  var authCreds = {
    type: 'oauth',
    token: user.accessToken
  };
  var collaboratorData = {
    user: user.profile.login,
    repo: req.params.repo,
    collabuser: config.BOT_USERNAME
  };
  console.log('data', collaboratorData);
  github(authCreds).repos.addCollaborator(collaboratorData, function (err) {
    if (err) {
      return next(err);
    }
    user.repos = user.repos || [];
    user.repos.push(req.params.repo);
    user.save(done);
  });
};

var webhookAll = function (req, res, next) {
  console.log('Webhook!', JSON.stringify(req.body, null, '  '));
  apiDone(res, next)();
}
