var express = require('express');
var landing = require('../controllers/landing');
var user = require('../controllers/user');

var router = express.Router();

router.get('/', landing.index);
router.get('/login', landing.login);
router.get('/logout', landing.logout);

router.post('/login', user.login);
router.post('/register', user.register);

module.exports = router;
