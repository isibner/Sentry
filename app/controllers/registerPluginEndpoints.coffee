module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth, getUserRepos}} = dependencies
  router = express.Router()
  return ({app, initPlugins: {sources, services}}) ->
    sourcesRouter = express.Router()
    _.forEach sources, (source) ->
      pluginRouter = express.Router()
      source.initializeHooks(pluginRouter)
      pluginRouter.use auth.ensureAuthenticated
      source.initializeAuthEndpoints(pluginRouter)
      pluginRouter.get '/icon', (req, res) ->
        return res.sendFile source.ICON_FILE_PATH
      sourcesRouter.use ('/' + source.NAME), pluginRouter

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

    router.use '/sources', sourcesRouter
    router.use '/services', noAuthServiceRouter
    router.use '/services', auth.ensureAuthenticated, serviceRouter
    app.use '/plugins', router
