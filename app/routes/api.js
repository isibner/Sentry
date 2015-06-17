var express = require('express');
var api = require('../controllers/api');

var router = express.Router();

var success = function (req, res) {
  res.send({success: true});
};

router.post('/addRepo/:repo', api.addRepo, api.initializeIssues);
router.post('/removeRepo/:repo', api.removeComments, api.removeWebhook, api.removeBot, api.removeFromUserRepos, success);
router.post('/webhook/all', api.webhookAll);

module.exports = router;
