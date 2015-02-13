var config = require('../../config/config');
var fileUtils = require('../../utils/fileUtils');
var todoUtils = require('../../utils/todoUtils');
var githubUtils = require('../../utils/githubUtils');

var temp = require('temp');
var exec = require('exec');
var walkSync = require('walk-sync');
var fs = require('fs');
var async = require('async');
var path = require('path');

var gitBlameWorker = function (tempFolderPath, issueQueue) {
  return function (task, callback) {
    var cwd = process.cwd();
    process.chdir(tempFolderPath);
    var gitPath = path.relative(tempFolderPath, task.path);
    task.filename = gitPath;
    exec(['git', 'blame', '-l', '-L' + task.lineNum + ',+1', '--', gitPath], function (err, out) {
      if (err) {
        throw err;
      }
      var importantPart = out.substring(1, out.indexOf(')') + 1);
      task.sha = importantPart.split('(')[0].trim();
      task.name = importantPart.split('(')[1].split(/[\d]{4}\-[\d]{2}\-[\d]{2}/i)[0].trim();
      issueQueue.push(task);
      process.chdir(cwd);
      callback();
    });
  };
};

var createIssueWorker = function (user, repo) {
  return function (task, callback) {
    task.fileref = '[' + task.filename + '](https://github.com/' + user.profile.username + '/' + repo + '/blob/' + task.sha + '/' + task.filename + '#' + task.lineNum + ')';
    githubUtils.createTodoIssue(task, user.profile.username, repo, callback);
  };
};

var parseTodos = function (files, repo) {
  var result = [];
  files.forEach(function (file) {
    for (var lineNum = 0; lineNum < file.lines.length; lineNum++) {
      var line = file.lines[lineNum];
      if (todoUtils.isTodo(line, file.path)) {
        result.push({
          title: todoUtils.getTodoTitle(line, file.path),
          lineNum: lineNum + 1,
          path: file.path,
          repo: repo
        });
      } else if (todoUtils.isTodoLabel(line, file.path)) {
        result[result.length - 1].labels = todoUtils.getTodoLabels(line, file.path);
      } else if (todoUtils.isTodoBody(line, file.path)) {
        result[result.length - 1].body = todoUtils.getTodoBody(line, file.path);
      }
    }
  });
  return result;
};

module.exports = function (req, res) {
  var tempFolderPath = temp.mkdirSync('todobot');
  var gitURL = 'https://' + config.BOT_USERNAME + ':' + config.BOT_PASSWORD + '@github.com/' + req.user.profile.username + '/' + req.params.repo + '.git';
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
      .filter(fileUtils.isFile)
      .filter(fileUtils.isTextFile)
      .map(function (filePath) {
        return {path: filePath, lines: fs.readFileSync(filePath, 'utf8').split('\n')};
      });
    var todos = parseTodos(files, req.params.repo);
    console.log('Parsed todos:', todos);
    var issueQueue = async.queue(createIssueWorker(req.user, req.params.repo), 2);
    var blameQueue = async.queue(gitBlameWorker(tempFolderPath, issueQueue), 5);

    issueQueue.drain = function () {
      console.log('issue queue drained');
      if (blameQueue.idle() || todos.length === 0) {
        res.send({success: true});
      }
    };
    blameQueue.drain = function () {
      console.log('blame queue drained');
    };

    blameQueue.push(todos);
    issueQueue.push([]);
  });
};
