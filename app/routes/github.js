var express = require('express');
var github = require('../controllers/github');

var router = express.Router();

router.get('/hooks/github', github.webhook);
router.post('/hooks/github', github.webhook);

module.exports = router;