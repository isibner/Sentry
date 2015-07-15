module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth, getUserRepos}} = dependencies
  router = express.Router()
  return ({app, initPlugins: {sourceProviders, services}}) ->
    sourceProvidersRouter = express.Router()
    for sourceProvider in sourceProviders
      pluginRouter = express.Router()
      sourceProvider.initializeAuthEndpoints(pluginRouter)
      pluginRouter.get '/icon', (req, res) ->
        return res.sendFile sourceProvider.ICON_FILE_PATH
      sourceProvidersRouter.use ('/' + sourceProvider.NAME), pluginRouter

    serviceRouter = express.Router()
    for service in services
      pluginRouter = express.Router()
      service.doSomethingToRegisterBalhBlahs(pluginRouter)
      serviceRouter.use ('/' + service.NAME), serviceRouter

    router.use '/source-providers', sourceProvidersRouter
    router.use '/services', serviceRouter
    app.use '/plugins', auth.ensureAuthenticated, router
