var github = require('../../config/github');
var config = require('../../config/config');

var temp = require('temp');
var exec = require('exec');
var walkSync = require('walk-sync');
var fs = require('fs');
var async = require('async');
var path = require('path');
var istextorbinary =  require('istextorbinary');


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

exports.webhookAll = function (req, res, next) {
  console.log('Webhook!');
  console.log(req.body);
  apiDone(res, next)();
};
