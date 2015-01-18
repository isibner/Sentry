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

module.exports = router;
