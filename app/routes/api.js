var router = express.Router();
var express = require('express');
var api = require('../controllers/api');


router.post('/addRepo/:repo', api.addRepo);
router.post('/webhook/all', api.webhookAll);

module.exports = router;
