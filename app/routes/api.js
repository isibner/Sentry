var express = require('express');
var api = require('../controllers/api');
var temp = require('temp');
var config = require('../../config/config');
var exec = require('exec');
var walkSync = require('walk-sync');
var fs = require('fs');
var async = require('async');

var router = express.Router();

router.post('/addRepo/:repo', api.addRepo);
router.post('/webhook/all', api.webhookAll);

module.exports = router;
