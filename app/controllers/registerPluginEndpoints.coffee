module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth, getUserRepos}} = dependencies
  router = express.Router()
  return ({app, initPlugins: {sourceProviders, services}}) ->
    sourceProvidersRouter = express.Router()
    for sourceProvider in sourceProviders
      pluginRouter = express.Router()
      sourceProvider.initializeHooks(pluginRouter)
      pluginRouter.use auth.ensureAuthenticated
      sourceProvider.initializeAuthEndpoints(pluginRouter)
      pluginRouter.get '/icon', (req, res) ->
        return res.sendFile sourceProvider.ICON_FILE_PATH
      sourceProvidersRouter.use ('/' + sourceProvider.NAME), pluginRouter

    serviceRouter = express.Router()
    for service in services
      pluginRouter = express.Router()
      service.initializeAuthEndpoints(pluginRouter)
      service.initializeOtherEndpoints(pluginRouter)
      console.log service.NAME
      serviceRouter.use ('/' + service.NAME), pluginRouter

    router.use '/source-providers', sourceProvidersRouter
    router.use '/services', auth.ensureAuthenticated, serviceRouter
    app.use '/plugins', router
