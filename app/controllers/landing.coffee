module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth}} = dependencies
  router = express.Router()
  return ({app}) ->
    router.get '/', auth.ensureAuthenticated, (req, res) -> res.render 'landing'

    router.get '/login', (req, res) -> res.render 'login'

    router.get '/logout', (req, res) ->
      req.logout()
      req.flash 'success', 'Logged out successfully.'
      res.redirect '/'

    app.use '/', router
