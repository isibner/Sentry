var github = require('../config/github');
var config = require('../config/config');

var async = require('async');

var ISSUE_QUEUE_SIZE = 1;

var botAuthCreds = module.exports.botAuthCreds = function () {
  return {
    type: 'basic',
    username: config.BOT_USERNAME,
    password: config.BOT_PASSWORD
  };
};

module.exports.authCreds = function (user) {
  return {
    type: 'oauth',
    token: user.accessToken
  };
};

var createTodoIssue = module.exports.createTodoIssue = function (todo, user, repo, callback) {
  var labels = todo.labels || [];
  if (labels.indexOf('todo') === -1) {
    labels.push('todo');
  }

  var body = (todo.body || 'No details provided.') + '\n\n---\n' + 'Created in ' + todo.sha + ' by ' + todo.name + '. See ' + todo.fileref + '.';

  var msg = {
    user: user,
    repo: repo,
    title: todo.title,
    body: body,
    labels: labels
  };

  github(botAuthCreds()).issues.create(msg, callback);
};

// TODO: Make this work with multiple pages
var closeTodoIssue = module.exports.closeTodoIssue = function (todo, user, repo, callback) {
  // get the issue number first
  var repoQuery = {
    user: user,
    repo: repo,
    state: 'open',
    creator: config.BOT_USERNAME,
    per_page: 100
  };

  github(botAuthCreds()).issues.repoIssues(repoQuery, function (repoIssueError, res) {
    if (repoIssueError) {
      return callback(repoIssueError);
    }
    var issueNumber = null;
    var issues = res;
    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i];

      if (issue.title === todo.title) {
        issueNumber = issue.number;
        break;
      }
    }

    if (issueNumber === null) {
      // No issue to close
      return callback(null);
    }

    var editQuery = {
      user: user,
      repo: repo,
      number: issueNumber,
      state: 'closed'
    };

    github(botAuthCreds()).issues.edit(editQuery, function (editQueryError) {
      if (editQueryError) {
        return callback(editQueryError);
      }
      var body = 'Completed task.' + '\n\n---\n' + 'Completed in ' + todo.sha + ' by ' + todo.name + '. See ' + todo.fileref + '.';
      var commentCreateQuery = {
        user: user,
        repo: repo,
        number: issueNumber,
        body: body
      };

      github(botAuthCreds()).issues.createComment(commentCreateQuery, function (createCommentError) {
        callback(createCommentError);
      });
    });
  });
};

module.exports.createTodoIssues = function (todos, user, repo, callback) {
  var todoCreatorWorker = function (todo, workerCallback) {
    createTodoIssue(todo, user, repo, workerCallback);
  };
  var q = async.queue(todoCreatorWorker, ISSUE_QUEUE_SIZE);
  q.drain = callback;

  q.push(todos);
};

module.exports.closeTodoIssues = function (todos, user, repo, callback) {
  var todoDestroyerWorker = function (todo, workerCallback) {
    closeTodoIssue(todo, user, repo, workerCallback);
  };
  var q = async.queue(todoDestroyerWorker, ISSUE_QUEUE_SIZE);
  q.drain = callback;

  q.push(todos);
};

module.exports.closeAllCreatedTodos = function (userName, repo, callback) {
  var repoQuery = {
    user: userName,
    repo: repo,
    state: 'open',
    creator: config.BOT_USERNAME,
    per_page: 100
  };
  github(botAuthCreds()).issues.repoIssues(repoQuery, function (repoIssueError, issues) {
    if (repoIssueError) {
      return callback(repoIssueError);
    }
    var tasks = issues.map(function (issue) {
      return function (cb) {
        var editQuery = {
          user: userName,
          repo: repo,
          number: issue.number,
          state: 'closed'
        };
        github(botAuthCreds()).issues.edit(editQuery, function (editQueryError) {
          if (editQueryError) {
            return cb(editQueryError);
          }
          var body = 'TodoBot removed from repository.';
          var commentCreateQuery = {
            user: userName,
            repo: repo,
            number: issue.number,
            body: body
          };

          github(botAuthCreds()).issues.createComment(commentCreateQuery, cb);
        });
      };
    });
    async.series(tasks, callback);
  });
};
