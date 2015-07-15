module.exports = (dependencies) ->
  {
    lib: {db},
    packages, config, controllers
  } = dependencies
  {server: {ROOT, APP_ROOT, COOKIE_SECRET, CALLBACK_URL}, github: {CLIENT_ID, CLIENT_SECRET}, plugins} = config
  {lodash: _, 'body-parser': bodyParser, 'cookie-parser': cookieParser, 'express-session': session, 'connect-flash': flash
   , 'express-handlebars': exphbs, 'express-validator': expressValidator, 'passport-github': passportGithub
   , glob, passport, express, path, handlebars} = packages
  # GitHubStrategy = passportGithub.Strategy
  User = db.model('User')
  return (app) ->
    # Initialize all plugins and sourceProviders
    initPlugins = {}
    {sourceProviders, services} = plugins
    initPlugins.sourceProviders = _.map sourceProviders, (Provider) -> new Provider({config, packages})
    initPlugins.services = _.map services, (Service) -> new Service({config, db, packages})

    app.disable 'x-powered-by'
    app.set 'views', path.join(APP_ROOT, 'views')
    app.engine '.hbs', exphbs(
      extname: '.hbs'
      defaultLayout: 'layout'
      handlebars: handlebars
      layoutsDir: path.join(APP_ROOT, 'views', 'layouts')
      partialsDir: path.join(APP_ROOT, 'views', 'partials')
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
    app.use cookieParser(COOKIE_SECRET)
    app.use session(
      secret: COOKIE_SECRET
      cookie: {maxAge: 1000 * 60 * 60}
      saveUninitialized: true
      resave: true
    )

    app.use flash()
    app.use (req, res, next) ->
      res.locals.successFlashes = req.flash 'success'
      res.locals.errorFlashes = req.flash 'error'
      next()

    app.use passport.initialize()
    app.use passport.session()

    # githubStrat = new GitHubStrategy(
    #   {
    #     clientID: CLIENT_ID,
    #     clientSecret: CLIENT_SECRET,
    #     callbackURL: CALLBACK_URL
    #   },
    #   ((accessToken, refreshToken, profile, done) ->
    #     User.findOrCreate(
    #       {'profile.id': profile.id},
    #       {profile, accessToken, refreshToken},
    #       (err, user) ->
    #         return done(err) if err
    #         user.profile = profile
    #         user.accessToken = accessToken
    #         user.refreshToken = refreshToken
    #         user.save(done)
    #     )
    #   )
    # )

    passport.serializeUser (user, done) -> done(null, user._id)
    passport.deserializeUser (_id, done) -> User.findOne({_id}).exec(done)

    app.use '/static', express.static(path.join ROOT, '/public')

    _.forEach controllers, (controller) ->
      controller({app, initPlugins})

    app.use (req, res, next) ->
      err = new Error('Not Found')
      err.status = 404
      next(err)

    app.use (err, req, res, next) ->
      console.error(err)
      err.status ?= 500
      err.stack = if app.get('env') is 'development' then err.stack else ''
      res.status(err.status).render 'error', {layout: false, error: err}
