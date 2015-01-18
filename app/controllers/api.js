var github = require('../../config/github');
var config = require('../../config/config');

var temp = require('temp');
var exec = require('exec');
var walkSync = require('walk-sync');
var fs = require('fs');
var async = require('async');
var path = require('path');
var istextorbinary =  require('istextorbinary');

var todoRegex = /^[\+|\-]?[\s]*[\W]*[\s]*TODO:[\W|\s]*/i; // regex match for finding a TODO comment
var labelRegex = /^\+?[\s]*[\W]*[\s]*TODO-LABELS:[\W|\s]*/i; // regex match for finding a LABELS comment
var bodyRegex = /^\+?[\s]*[\W]*[\s]*TODO-BODY:[\W|\s]*/i; // regex match for finding a BODY comment

var isFile = function (path) {
  return fs.lstatSync(path).isFile();
};

var isTextFile = function (path) {
  return istextorbinary.isTextSync(path, fs.readFileSync(path));
};

var isTodo = function(str) {
  return todoRegex.test(str);
};

var getTodoTitle = function(str) {
  return str.split(todoRegex)[1];
};

var isTodoLabel = function(str) {
  return labelRegex.test(str);
};

var isTodoBody = function(str) {
  return bodyRegex.test(str);
};

var getTodoData = function(additions, idx) {
  if (idx >= additions.length) { return null; }

  var str = additions[idx].line;

  if (isTodoLabel(str)) {
    var labels = str.split(labelRegex)[1].split(', ');
    return ['labels', labels];
  } else if (isTodoBody(str)) {
    return ['body', str.split(bodyRegex)[1]];
  } else {
    return null;
  }
};

var getLabels = function (line) {
  return line.split(labelRegex)[1];
};

var getBody = function (line) {
  return line.split(bodyRegex)[1];
};

var gitBlameWorker = function (tempFolderPath, issueQueue) {
  return function (task, callback) {
    var cwd = process.cwd();
    process.chdir(tempFolderPath);
    var gitPath = path.relative(tempFolderPath, task.path);
    task.filename = gitPath;
    exec(['git', 'blame', '-L' + task.lineNum + ',+1', '--', gitPath], function (err, out, code) {
      // TODO: Make this prettier.
      var importantPart = out.substring(1, out.indexOf(')') + 1);
      task.sha = importantPart.split('(')[0].trim();
      task.name = importantPart.split('(')[1].split(/[\d]{4}\-[\d]{2}\-[\d]{2}/i)[0].trim();
      issueQueue.push(task);
      callback();
    });
  }
};

var createIssueWorker = function (user, repo) {
  return function (task, callback) {
    task.fileref = '[' + task.filename + '](https://github.com/' + user.profile.username + '/' + repo + '/blob/' + todo.sha + '/' + todo.filename + '#' + todo.lineNum + ')'
    createTodoIssue(task, user.profile.username, repo, callback);
  };
};

var parseTodos = function (files, repo) {
  var result = [];
  files.forEach(function (file) {
    for (var lineNum = 0; lineNum < file.lines.length; lineNum++) {
      var line = file.lines[lineNum];
      if (isTodo(line)) {
        console.log(file.path);
        console.log('isTodo', line);
        result.push({
          title: getTodoTitle(line),
          lineNum: lineNum + 1,
          path: file.path,
          repo: repo
        });
      } else if (isTodoLabel(line)) {
        console.log(file.path);
        console.log('isTodoLabel', line);
        result[result.length - 1].label = getLabels(line);
      } else if (isTodoBody(line)) {
        console.log(file.path);
        console.log('isTodoBody', line);
        result[result.length - 1].body = getBody(line);
      }
    }
  });
  return result;
};

var apiDone = function (res, next) {
  return function (err) {
    if (err) {
      return next(err);
    }
    res.send({success: true});
  };
};

var addIssues = function (req, res, next) {
  var tempFolderPath = temp.mkdirSync('todobot');
  var gitURL = 'https://'  + config.BOT_USERNAME + ':' + config.BOT_PASSWORD + '@github.com/' + req.user.profile.username + '/' + req.params.repo + '.git';
  exec(['git', 'clone', gitURL, tempFolderPath], function (err, out, code) {
    if (code !== 0) {
      return res.send({err: err, output: out, code: code});
    }
    var files = walkSync(tempFolderPath)
      .filter(function (filename) {
        return filename.indexOf('.git/') !== 0;
      })
      .map(function (filename) {
        return path.join(tempFolderPath, filename);
      })
      .filter(isFile)
      .filter(isTextFile)
      .map(function (path) {
        return {path: path, lines: fs.readFileSync(path, 'utf8').split('\n')};
      });
    var todos = parseTodos(files, req.params.repo);
    console.log('Parsed todos:', todos);
    var issueQueue = async.queue(createIssueWorker(req.user, req.params.repo), 2);
    var blameQueue = async.queue(gitBlameWorker(tempFolderPath, issueQueue), 5);

    issueQueue.drain = function () {
      console.log('issue queue drained');
      if (blameQueue.idle() || todos.length === 0) {
        apiDone(res, next)();
      }
    };
    blameQueue.push(todos);
    blameQueue.drain = function () {
      console.log('blame queue drained');
    };
    issueQueue.push([]);
  });
};

exports.addRepo = function (req, res, next) {
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
  github(authCreds).repos.addCollaborator(collaboratorData, function (err) {
    if (err) {
      return next(err);
    }
    user.repos = user.repos || [];
    user.repos.push(req.params.repo);
    user.save(function () {
      addIssues(req, res, next);
    });
  });
};

var getTodos = function(additions) {
  var todos = [];

  for (var i = 0; i < additions.length; i++) {
    var addition = additions[i];
    if (isTodo(addition.line)) {
      var todo = {
        title: getTodoTitle(addition.line),
        sha: addition.sha,
        filename: addition.filename,
        fileref: addition.fileref,
        name: addition.name,
      };

      var idx = i+1;
      var data = getTodoData(additions, idx);
      while (data != null) {
        todo[data[0]] = data[1];
        idx++;
        var data = getTodoData(additions, idx);
      }

      todos.push(todo);
    }
  }

  return todos;
}

var getRemovedTodos = function(subtractions) {
  var todos = [];

  for (var i = 0; i < subtractions.length; i++) {
    var subtraction = subtractions[i];
    if (isTodo(subtraction.line)) {
      var todo = {
        title: getTodoTitle(subtraction.line),
        sha: subtraction.sha,
        filename: subtraction.filename,
        fileref: subtraction.fileref,
        name: subtraction.name,
      };

      todos.push(todo);
    }
  }

  return todos;
}

var createTodoIssue = function(todo, user, repo, callback) {
  var authCreds = {
    type: 'basic',
    username: config.BOT_USERNAME,
    password: config.BOT_PASSWORD,
  };

  var labels = todo.labels || [];
  labels.push('todo');

  var body = (todo.body || 'No details provided.') + '\n\n---\n' + 'Created in ' + todo.sha + ' by ' + todo.name + '. See ' + todo.fileref + '.';

  msg = {
    user: user,
    repo: repo,
    title: todo.title,
    body: body,
    labels: labels,
  };

  github(authCreds).issues.create(msg, callback);
}

var createTodoIssues = function(todos, user, repo, callback) {
  var todoCreatorWorker = function (todo, workerCallback) {
    createTodoIssue(todo, user, repo, workerCallback);
  };
  var q = async.queue(todoCreatorWorker, 2);
  q.drain = callback;

  q.push(todos);
}

var closeTodoIssue = function(todo, user, repo, callback) {
  var authCreds = {
    type: 'basic',
    username: config.BOT_USERNAME,
    password: config.BOT_PASSWORD,
  };

  // get the issue number first
  msg = {
    user: user,
    repo: repo,
    state: 'open',
    labels: 'todo',
    per_page: 100,
  };

  github(authCreds).issues.repoIssues(msg, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
    }
  });

  // msg = {
  //   user: user,
  //   repo: repo,
  //   title: todo.title,
  //   body: todo.body || '',
  //   // TODO: update ova here!
  //   labels: ['todo'],
  // };

  // github(authCreds).issues.create(msg, function(err, res) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(res);
  //   }
  // });
}

var closeTodoIssues = function(todos, user, repo, callback) {
  for (var i = 0; i < todos.length; i++) {
    var todo = todos[i];

    removeTodoIssue(todo, user, repo, callback);
  }
}

var webhookPushHandler = function(data, callback) {
  var authCreds = {
    type: 'basic',
    username: config.BOT_USERNAME,
    password: config.BOT_PASSWORD,
  };

  var repoOwner = data.repository.owner.name;
  var repoName = data.repository.name;
  var commitShaBefore = data.before;
  var commitShaAfter = data.after;

  var msg = {
    user: repoOwner,
    repo: repoName,
    base: commitShaBefore,
    head: commitShaAfter,
  }

  var additions = [];
  var subtractions = [];

  var commit = github(authCreds).repos.compareCommits(msg, function(err, res) {
    // var author = res.author.login;
    console.log(JSON.stringify(res, null, '  '));
    var files = res.files;

    // go thru each files, find the patches, and separate the additions from subtractions in file
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
            name: '@' + res.base_commit.committer.login,
          });
        } else if (line.lastIndexOf('-', 0) === 0) {
          subtractions.push({
            line: line,
            sha: file.sha,
            filename: file.filename,
            fileref: file.blob_url,
            name: '@' + res.base_commit.committer.login,
          });
        }
      }
    }

    newTodos = getTodos(additions);
    console.log('New Todos: ', newTodos);

    removedTodos = getRemovedTodos(subtractions);
    console.log('Removed Todos: ', removedTodos);

    createTodoIssues(newTodos, repoOwner, repoName, callback);
    closeTodoIssues(removedTodos, callback);

  });
}

exports.webhookAll = function (req, res, next) {
  console.log('Webhook!');
  // console.log(req);
  webhookPushHandler(req.body, apiDone(res, next));
  
};
