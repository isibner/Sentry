module.exports = (dependencies) ->
  {
    packages: {lodash: _, 'body-parser': bodyparser, 'cookie-parser': cookieparser, 'express-session': session, 'connect-flash': flash
               , 'express-handlebars': exphbs, 'express-validator': expressValidator, 'passport-github': passportGithub, glob, passport, express, path},
    config: {server: {APP_ROOT, COOKIE_SECRET, CALLBACK_URL}, github: {CLIENT_ID, CLIENT_SECRET}, plugins},
    lib: {githubAPI}
    db,
    controllers
  } = dependencies
  GitHubStrategy = passportGithub.Strategy
  User = db.model('User')
  return (app) ->
    app.disable 'x-powered-by'
    app.set 'views', path.join(APP_ROOT, 'views')
    app.engine '.hbs', exphbs(
      extname: '.hbs'
      defaultLayout: 'layout'
      layoutsDir: path.join(config.appRoot, 'views', 'layouts')
      partialsDir: path.join(config.appRoot, 'views', 'partials')
      helpers:
        toJSON: (obj) -> JSON.stringify(obj, null, '  ')
        addOrRemove: -> if @todoBotActive then 'remove' else 'add'
        isRemove: -> @todoBotActive
        addOrRemoveCaps: -> if @todoBotActive then 'Remove' else 'Add'
    )
    app.set 'view engine', '.hbs'
    app.set 'port', process.env.PORT || 3000
    app.use bodyParser.urlencoded({extended: false})
    app.use bodyParser.json()
    app.use expressValidator()
    app.use cookieparser(COOKIE_SECRET)
    app.use session(
      secret: COOKIE_SECRET
      cookie: {maxAge: 1000 * 60 * 60}
      saveUninitialized: true
      resave: true
    )
    app.use flash()

    app.use passport.initialize()
    app.use passport.session()

    githubStrat = new GitHubStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL
      },
      ((accessToken, refreshToken, profile, done) ->
        User.findOrCreate(
          {'profile.id': profile.id},
          {profile, accessToken, refreshToken},
          (err, user) ->
            return done(err) if err
            user.profile = profile
            user.accessToken = accessToken
            user.refreshToken = refreshToken
            user.save(done)
        )
      )
    )

    passport.serializeUser (user, done) -> done(null, user.profile.id)
    passport.deserializeUser (id, done) -> User.findOne({'profile.id': id}).exec(done)

    app.use (req, res, next) ->
      res.locals.successFlashes = req.flash 'success'
      res.locals.errorFlashes = req.flash 'error'
      if req.user
        res.locals.authUser = req.user
      next()

    app.use '/static', express.static(config.ROOT + '/public')

    # Every plugin is Github........FOR NOW
    initPlugins = _.map plugins, (Plugin) -> return new Plugin(githubAPI, db)

    for controller in controllers
      controller(app, initPlugins)

    app.use (req, res, next) ->
      err = new Error('Not Found')
      err.status = 404
      next(err)

    app.use (err, req, res, next) ->
      console.error(err)
      err.status ?= 500
      err.stack = if app.get('env') is 'development' then err.stack else ''
      res.status(err.status).render 'error', {layout: false, error: err}
