var express = require('express');
var landing = require('../controllers/landing');
var auth = require('../controllers/auth');
var user = require('../controllers/user');

var router = express.Router();

router.get('/', auth.ensureAuthenticated, landing.getUserRepos, landing.index);
router.get('/login', landing.login);
router.get('/logout', landing.logout);

router.get('/settings', landing.settings);

router.post('/login', user.login);

module.exports = router;
