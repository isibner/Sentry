var express = require('express');
var api = require('../controllers/api');

var router = express.Router();

router.post('/addRepo/:repo', api.addRepo, api.initializeIssues);
router.post('/removeRepo/:repo', api.removeComments, api.removeWebhook, api.removeBot);
router.post('/webhook/all', api.webhookAll);

module.exports = router;
