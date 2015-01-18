var logger = require('morgan'),
    path = require('path'),
    config = require('../config/config'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    flash = require('connect-flash'),
    exphbs = require('express-handlebars'),
    expressValidator = require('express-validator'),
    GitHubStrategy = require('passport-github').Strategy;

var db = require('../config/db');
var User = db.model('User');

module.exports = function (app) {
  app.disable('x-powered-by');
  app.set('views', path.join(config.appRoot, 'views'));
  app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(config.appRoot, 'views', 'layouts'),
    partialsDir: path.join(config.appRoot, 'views', 'partials'),
    helpers: {
      toJSON: function (obj) {
        return JSON.stringify(obj, null, '  ');
      },
      addOrRemove: function () {
        return this.todoBotActive ? 'remove' : 'add';
      },
      addOrRemoveCaps: function () {
        return this.todoBotActive ? 'Remove' : 'Add';
      }
    }
  }));
  app.set('view engine', '.hbs');
  app.set('port', process.env.PORT || 3000);

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(expressValidator());
  app.use(cookieParser(config.cookieSecret));
  app.use(session({
    secret: config.cookieSecret,
    cookie: {maxAge: 1000 * 60 * 60},
    saveUninitialized: true,
    resave: true
  }));
  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new GitHubStrategy({
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: "https://pennapps-todo.herokuapp.com/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate({
        'profile.id': profile.id
      }, {
        profile: profile,
        accessToken: accessToken,
        refreshToken: refreshToken
      }, function (err, user) {
        user.profile = profile;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.save(done);
      });
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user.profile.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({'profile.id': id}).exec(done);
  });

  app.use(function(req, res, next) {
    res.locals.successFlashes = req.flash('success');
    res.locals.errorFlashes = req.flash('error');

    if (req.user) {
      res.locals.authUser = req.user;
    }

    next();
  });

  // app.use(logger('dev'));
  app.use('/static', express.static(config.root + '/public'));

  app.use('/', require('./routes/landing'));
  app.use('/api', require('./routes/api'));
  app.use('/auth', require('./routes/auth'));

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  /*eslint-disable no-unused-vars */
  app.use(function (err, req, res, next) {
    console.error(err);
    err.status = err.status || 500;
    res.status(err.status).render('error', {
      layout: false,
      error: {
        message: err.message,
        status: err.status,
        stack: app.get('env') === 'development' ? err.stack : ''
      }
    });
  });
  /*eslint-enable no-unused-vars */
};
