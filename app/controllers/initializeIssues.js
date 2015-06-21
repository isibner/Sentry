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

var ISSUE_QUEUE_SIZE = 1;
var BLAME_QUEUE_SIZE = 5;

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
    var todos = todoUtils.parseTodos(files, req.params.repo);
    var issueQueue = async.queue(createIssueWorker(req.user, req.params.repo), ISSUE_QUEUE_SIZE);
    var blameQueue = async.queue(gitBlameWorker(tempFolderPath, issueQueue), BLAME_QUEUE_SIZE);

    issueQueue.drain = function () {
      if (blameQueue.idle() || todos.length === 0) {
        res.send({success: true});
      }
    };
    blameQueue.drain = function () {};

    blameQueue.push(todos);
    issueQueue.push([]);
  });
};
