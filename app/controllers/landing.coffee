module.exports = (dependencies) ->
  {packages: {express}} = dependencies
  router = express.Router()
  return ({app, initPlugins}) ->
    router.get '/', (req, res) ->
      res.render 'index', {isIndex: true}

    router.get '/logout', (req, res) ->
      req.logout()
      req.flash 'success', 'Logged out successfully.'
      res.redirect '/'

    app.use '/', router
