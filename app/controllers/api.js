var github = require('../../config/github');
var config = require('../../config/config');
var webhookPushHandler = require('./webhookPushHandler');

module.exports.addRepo = function (req, res, next) {
  var user = req.user;
  var authCreds = {
    type: 'oauth',
    token: user.accessToken
  };
  var collaboratorData = {
    user: user.profile.username,
    repo: req.params.repo,
    collabuser: config.BOT_USERNAME
  };
  github(authCreds).repos.addCollaborator(collaboratorData, function (addCollabError) {
    if (addCollabError) {
      return next(addCollabError);
    }
    var hookData = {
      user: user.profile.username,
      repo: req.params.repo,
      name: 'web',
      events: ['push'],
      active: true,
      config: {
        url: 'https://pennapps-todo.herokuapp.com/api/webhook/all',
        content_type: 'json',
        insecure_ssl: 1
      }
    };
    github(authCreds).repos.createHook(hookData, function (hookCreateError) {
      if (hookCreateError) {
        return next(hookCreateError);
      }
      user.repos = user.repos || [];
      user.repos.push(req.params.repo);
      user.save(function (userSaveError) {
        next(userSaveError);
      });
    });
  });
};

// TODO: Take out console.logs
module.exports.webhookAll = function (req, res, next) {
  console.log('Webhook!');
  if (req.get('X-GitHub-Event') === 'ping') {
    res.send({success: true});
  } else {
    webhookPushHandler(req.body, function (err) {
      if (err) {
        return next(err);
      }
      res.send({success: true});
    });
  }
};

module.exports.initializeIssues = require('./initializeIssues');
