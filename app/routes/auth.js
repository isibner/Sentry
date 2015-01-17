var express = require('express');
var auth = require('../controllers/auth');

var router = express.Router();

router.get('/github', auth.github, auth.noop);

router.get('/github/callback', auth.githubCallback, auth.githubCallbackResolution);

module.exports = router;
