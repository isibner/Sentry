module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth}} = dependencies
  router = express.Router()
  return ({app}) ->
    router.get '/', (req, res) -> res.render 'index'

    router.get '/logout', (req, res) ->
      req.logout()
      req.flash 'success', 'Logged out successfully.'
      res.redirect '/'

    router.get '/dashboard', auth.ensureAuthenticated, (req, res) -> res.render 'dashboard'

    app.use '/', router
