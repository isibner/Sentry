var github = require('../../config/github');
var config = require('../../config/config');

var temp = require('temp');
var exec = require('exec');
var walkSync = require('walk-sync');
var fs = require('fs');
var async = require('async');
var path = require('path');
var istextorbinary =  require('istextorbinary');

var todoRegex = /^[\+|\-][\s]+[\W]*[\s]*TODO[\W|\s]*/i; // regex match for finding a TODO comment
var labelRegex = /^\+[\s]+[\W]*[\s]*LABELS[\W|\s]*/i; // regex match for finding a LABELS comment
var bodyRegex = /^\+[\s]+[\W]*[\s]*BODY[\W|\s]*/i; // regex match for finding a BODY comment


var isFile = function (path) {
  return fs.lstatSync(path).isFile();
};

var isTextFile = function (path) {
  return istextorbinary.isTextSync(path, fs.readFileSync(path));
};

var gitBlameWorker = function (tempFolderPath, issueQueue) {
  return function (task, callback) {
    var cwd = process.cwd();
    process.chdir(tempFolderPath);
    var blamePath = path.relative(tempFolderPath, task.path);
    exec(['git', 'blame', '-L' + lineNum + ',+1', '--', blamePath], function (err, out, code) {
      // TODO: Make this prettier.
      var importantPart = out.substring(0, out.indexOf(')') + 1);
      task.blameMessage = importantPart;
      issueQueue.push(task);
      callback();
    });
  }
};

var createIssueWorker = function (user) {
  return function (task, callback) {
    console.log('Run issue task: ', {
      username: user.profile.login,
      task: task
    });
    callback();
  };
};

var parseTodos = function (files) {
  var result = [];
  files.forEach(function (file) {
    var regex = getRegex(file.path);
    for (var lineNum = 1; lineNum <= file.lines.length; lineNum++) {
      var line = file.lines[lineNum];
      // TODO: Define isTodo, getTodoTitle, isLabel, getLabels, isBody, getBody
      if (isTodo(line)) {
        result.push({
          title: getTodoTitle(line),
          lineNum: lineNum,
          path: file.path
        });
      } else if (isLabel(line)) {
        result[result.length - 1].label = getLabels(line);
      } else if (isBody(line)) {
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
  var gitURL = 'https://'  + config.BOT_USERNAME + ':' + config.BOT_PASSWORD + '@github.com/FabioFleitas/todo.git';
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
    var todos = parseTodos(files);
    var issueQueue = async.queue(createIssueWorker(req.user), 2);
    var blameQueue = async.queue(gitBlameWorker(tempFolderPath, issueQueue), 5);

    issueQueue.drain = function () {
      if (blameQueue.idle()) {
        apiDone(res, next)();
      }
    };
    blameQueue.push(todos);
  });
};

exports.addRepo = function (req, res, next) {
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
    user.save(function () {
      addIssues(req, res, next);
    });
  });
};

var isTodo = function(str) {
  return todoRegex.test(str);
}

var getTodoTitle = function(str) {
  return str.split(todoRegex)[1];
}

var isTodoLabel = function(str) {
  return labelRegex.test(str);
}

var isTodoBody = function(str) {
  return bodyRegex.test(str);
}

var getTodoData = function(additions, idx) {
  if (idx >= additions.length) { return null; }

  var str = additions[idx];

  if (isTodoLabel(str)) {
    return ['labels', str.split(labelRegex)[1]];
  } else if (isTodoBody(str)) {
    return ['body', str.split(bodyRegex)[1]];
  } else {
    return null;
  }
}

var getTodos = function(additions) {
  var todos = [];

  for (var i = 0; i < additions.length; i++) {
    var addition = additions[i];
    if (isTodo(addition)) {
      var todo = {
        title: getTodoTitle(addition),
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
    if (isTodo(subtraction)) {
      var todo = {
        title: getTodoTitle(subtraction),
      };

      todos.push(todo);
    }
  }

  return todos;
}

var createNewIssues = function(todos, user, repo) {
  for (var i = 0; i < todos.length; i++) {
    var todo = todos[i];

    var authCreds = {
      type: 'basic',
      username: config.BOT_USERNAME,
      password: config.BOT_PASSWORD,
    };

    msg = {
      user: user,
      repo: repo,
      title: todo.title,
      body: todo.body,
      // TODO: update right here!
      labels: ['todo'],
    };

    github(authCreds).issues.create(msg, function(err, res) {
      console.log(err);
      console.log(res);
    });

  }
}

var webhookPushHandler = function(data) {
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
    console.log(res);
    var files = res.files;

    // go thru each files, find the patches, and separate the additions from subtractions in file
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var patch = file.patch.split('\n');

      for (var j = 0; j < patch.length; j++) {
        var line = patch[j];

        if (line.lastIndexOf('+', 0) === 0) {
          additions.push(line);
        } else if (line.lastIndexOf('-', 0) === 0) {
          subtractions.push(line);
        }
      }
    }

    console.log(additions);
    console.log(subtractions);

    newTodos = getTodos(additions);
    console.log("New Todos");
    console.log(newTodos);

    removedTodos = getRemovedTodos(subtractions);
    console.log("Removed Todos");
    console.log(removedTodos);

    createNewIssues(additions, repoOwner, repoName);

  });
}

exports.webhookAll = function (req, res, next) {
  console.log('Webhook!');
  // console.log(req);
  webhookPushHandler(req.body);
  apiDone(res, next)();
};
