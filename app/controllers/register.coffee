module.exports = (dependencies) ->
  {packages: {express, bcryptjs, passport}, middleware: {auth}, lib: {db}} = dependencies
  User = db.model('User')
  router = express.Router()
  return ({app}) ->
    router.post '/', (req, res, next) ->
      {username, password} = req.body
      User.findOne {username}, (err, user) ->
        if user
          req.flash 'error', 'Username taken'
          return res.redirect '/register'
        return next(err) if err
        hashedPassword = bcryptjs.hashSync(password, bcryptjs.genSaltSync(10))
        user = new User {username, hashedPassword}
        user.save (err) ->
          return next(err) if err
          passport.authenticate('local') req, res, ->
            res.redirect '/dashboard'


    router.get '/', (req, res) -> res.render 'register'

    app.use '/register', router
