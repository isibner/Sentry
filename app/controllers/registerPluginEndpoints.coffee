module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth, getUserRepos}} = dependencies
  router = express.Router()
  return ({app, initPlugins: {sourceProviders, services}}) ->
    sourceProvidersRouter = express.Router()
    _.forEach sourceProviders, (sourceProvider) ->
      pluginRouter = express.Router()
      sourceProvider.initializeHooks(pluginRouter)
      pluginRouter.use auth.ensureAuthenticated
      sourceProvider.initializeAuthEndpoints(pluginRouter)
      pluginRouter.get '/icon', (req, res) ->
        return res.sendFile sourceProvider.ICON_FILE_PATH
      sourceProvidersRouter.use ('/' + sourceProvider.NAME), pluginRouter

    serviceRouter = express.Router()
    _.forEach services, (service) ->
      pluginRouter = express.Router()
      service.initializeAuthEndpoints(pluginRouter)
      service.initializeOtherEndpoints(pluginRouter)
      pluginRouter.get '/icon', (req, res) ->
        return res.sendFile service.ICON_FILE_PATH
      serviceRouter.use ('/' + service.NAME), pluginRouter

    noAuthServiceRouter = express.Router()
    _.forEach services, (service) ->
      pluginRouter = express.Router()
      if service.initializePublicEndpoints?
        service.initializePublicEndpoints(pluginRouter)
        noAuthServiceRouter.use ('/' + service.NAME), pluginRouter

    router.use '/source-providers', sourceProvidersRouter
    router.use '/services', noAuthServiceRouter
    router.use '/services', auth.ensureAuthenticated, serviceRouter
    app.use '/plugins', router
