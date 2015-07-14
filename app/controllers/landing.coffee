module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth, getUserRepos}} = dependencies
  router = express.Router()
  return (app) ->
    router.get '/', auth.ensureAuthenticated, getUserRepos, (req, res) -> res.render 'landing'

    router.get '/login', (req, res) -> res.render 'login'

    router.get '/logout', (req, res) ->
      req.logout()
      req.flash 'success', 'Logged out successfully.'
      res.redirect '/'

    router.get '/settings', (req, res) -> res.render 'settings'

    app.use '/', router
