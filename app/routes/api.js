var router = express.Router();
var express = require('express');
var api = require('../controllers/api');
var temp = require('temp');
var config = require('../../config/config');
var exec = require('exec');
var walkSync = require('walk-sync');
var fs = require('fs');
var async = require('async');


var isFile = function (path) {
  return fs.lstatSync(path).isFile();
};

router.post('/addRepo/:repo', api.addRepo);
router.post('/webhook/all', api.webhookAll);
router.get('/cloneThing', function (req, res, next) {
  var tempFolderPath = temp.mkdirSync('todobot');
  var gitURL = 'https://'  + config.BOT_USERNAME + ':' + config.BOT_PASSWORD + '@github.com/FabioFleitas/todo.git';
  exec(['git', 'clone', gitURL, tempFolderPath], function (err, out, code) {
    if (code !== 0) {
      return res.send({err: err, output: out, code: code});
    }
    var files = walkSync(tempFolderPath).filter(isFile);
    res.send(files);
  });
});

module.exports = router;
