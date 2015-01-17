var express = require('express');
var api = require('../controllers/api');

var router = express.Router();

router.post('/addRepo/:repo', api.addRepo);

module.exports = router;