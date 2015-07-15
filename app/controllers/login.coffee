module.exports = (dependencies) ->
  {packages: {express, bcryptjs, passport}, middleware: {auth}, lib: {db}} = dependencies
  User = db.model('User')
  router = express.Router()
  return ({app}) ->
    authenticationMiddleware = passport.authenticate 'local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true
    }

    router.post '/', authenticationMiddleware

    router.get '/', (req, res) -> res.render 'login'

    app.use '/login', router
