var github = require('../../config/github');
var config = require('../../config/config');
var todoUtils = require('../../utils/todoUtils');
var githubUtils = require('../../utils/githubUtils');

var getTodoData = function (additions, idx) {
  if (idx >= additions.length) {
    return null;
  }

  var line = additions[idx].line;
  var filename = additions[idx].filename;

  if (todoUtils.isTodoLabel(line, filename)) {
    return {
      type: 'labels',
      value: todoUtils.getTodoLabels(line, filename)
    };
  } else if (todoUtils.isTodoBody(line, filename)) {
    return {
       type: 'body',
       value: todoUtils.getTodoBody(line, filename)
     };
  } else {
    return null;
  }
};

var getTodos = function (additions) {
  var todos = [];

  for (var i = 0; i < additions.length; i++) {
    var addition = additions[i];
    if (todoUtils.isTodo(addition.line, addition.filename)) {
      var todo = {
        title: todoUtils.getTodoTitle(addition.line, addition.filename),
        sha: addition.sha,
        filename: addition.filename,
        fileref: addition.fileref,
        name: addition.name
      };

      var idx = i + 1;
      var todoData = getTodoData(additions, idx);
      while (todoData !== null) {
        todo[todoData.type] = todoData.value;
        idx++;
        todoData = getTodoData(additions, idx);
      }

      todos.push(todo);
    }
  }

  return todos;
};

var getRemovedTodos = function (subtractions) {
  var todos = [];

  for (var i = 0; i < subtractions.length; i++) {
    var subtraction = subtractions[i];
    if (todoUtils.isTodo(subtraction.line, subtraction.filename)) {
      var todo = {
        title: todoUtils.getTodoTitle(subtraction.line, subtraction.filename),
        sha: subtraction.sha,
        filename: subtraction.filename,
        fileref: subtraction.fileref,
        name: subtraction.name
      };

      todos.push(todo);
    }
  }

  return todos;
};

module.exports = function (data, callback) {
  var authCreds = {
    type: 'basic',
    username: config.BOT_USERNAME,
    password: config.BOT_PASSWORD
  };

  var repoOwner = data.repository.owner.name;
  var repoName = data.repository.name;
  var commitShaBefore = data.before;
  var commitShaAfter = data.after;

  var msg = {
    user: repoOwner,
    repo: repoName,
    base: commitShaBefore,
    head: commitShaAfter
  };

  var additions = [];
  var subtractions = [];

  github(authCreds).repos.compareCommits(msg, function (err, res) {
    if (err) {
      callback(err);
    }
    var files = res.files;

    // go thru each file, find the patches, and separate the additions from subtractions in file
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var patch = file.patch.split('\n');

      for (var j = 0; j < patch.length; j++) {
        var line = patch[j];

        if (line.lastIndexOf('+', 0) === 0) {
          additions.push({
            line: line,
            sha: commitShaAfter,
            filename: file.filename,
            fileref: '[' + file.filename + '](' + file.blob_url + ')',
            name: '@' + res.base_commit.committer.login
          });
        } else if (line.lastIndexOf('-', 0) === 0) {
          subtractions.push({
            line: line,
            sha: commitShaAfter,
            filename: file.filename,
            fileref: '[' + file.filename + '](' + file.blob_url + ')',
            name: '@' + res.base_commit.committer.login
          });
        }
      }
    }

    var newTodos = getTodos(additions);
    var removedTodos = getRemovedTodos(subtractions);

    // TODO: Handle todo creation error
    githubUtils.createTodoIssues(newTodos, repoOwner, repoName, function () {
      githubUtils.closeTodoIssues(removedTodos, repoOwner, repoName, callback);
    });

  });
};
