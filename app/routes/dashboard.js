var express = require('express');
var dashboard = require('../controllers/dashboard');

var router = express.Router();

var auth = require('../middlewares/auth');
router.use(auth.requireLogin);
router.use(function (req, res, next) {
  res.locals.layout = 'dashboard';
  next();
});

router.get('/', dashboard.index);

module.exports = router;
