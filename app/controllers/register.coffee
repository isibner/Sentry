module.exports = (dependencies) ->
  {packages: {express, bcryptjs, passport}, middleware: {auth}, lib: {db}} = dependencies
  User = db.model('User')
  router = express.Router()
  return ({app}) ->
    router.post '/', (req, res, next) ->
      {username, password} = req.body
      User.findOne {username}, (userFindError, user) ->
        if user
          req.flash 'error', 'Username taken'
          return res.redirect '/register'
        return next(userFindError) if userFindError?
        hashedPassword = bcryptjs.hashSync(password, bcryptjs.genSaltSync(10))
        user = new User {username, hashedPassword}
        user.save (saveError) ->
          return next(saveError) if saveError?
          passport.authenticate('local') req, res, ->
            res.redirect '/dashboard'

    router.get '/', (req, res) -> res.render 'register'

    app.use '/register', router
