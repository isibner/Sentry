var _ = require('lodash');
var ghUtils = require('../../utils/githubUtils');
var authCreds = ghUtils.authCreds;
var github = require('../../config/github');
var config = require('../../config/config');
var webhookPushHandler = require('./webhookPushHandler');

module.exports.addRepo = function (req, res, next) {
  var user = req.user;
  var collaboratorData = {
    user: user.profile.username,
    repo: req.params.repo,
    collabuser: config.BOT_USERNAME
  };
  github(authCreds(user)).repos.addCollaborator(collaboratorData, function (addCollabError) {
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
    github(authCreds(user)).repos.createHook(hookData, function (hookCreateError, result) {
      if (hookCreateError) {
        return next(hookCreateError);
      }
      user.repos = user.repos || [];
      user.repos.push({name: req.params.repo, hookId: result.id});
      user.save(next);
    });
  });
};

module.exports.removeComments = function (req, res, next) {
  var user = req.user;
  if (req.body.removeComments) {
    console.log('ASDF REMOVNG COMMENTS YO');
    ghUtils.closeAllCreatedTodos(user.profile.username, req.params.repo, next);
  } else {
    next();
  }
};

module.exports.removeWebhook = function (req, res, next) {
  var user = req.user;
  var webHookId = _.find(user.repos, function (repoObject) {
    return repoObject.name === req.params.repo;
  }).hookId;
  var hookDeleteData = {
    user: user.profile.username,
    repo: req.params.repo,
    id: webHookId
  };
  github(authCreds(user)).repos.deleteHook(hookDeleteData, next);
};

module.exports.removeFromUserRepos = function (req, res, next) {
  req.user.repos = _.reject(req.user.repos, function (repoObject) {
    return repoObject.name === req.params.repo;
  });
  req.user.save(next);
};

module.exports.removeBot = function (req, res, next) {
  var user = req.user;
  var collaboratorData = {
    user: user.profile.username,
    repo: req.params.repo,
    collabuser: config.BOT_USERNAME
  };
  github(authCreds(user)).repos.removeCollaborator(collaboratorData, next);
};

module.exports.webhookAll = function (req, res, next) {
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
