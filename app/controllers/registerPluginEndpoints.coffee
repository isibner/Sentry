module.exports = (dependencies) ->
  {packages: {lodash: _, express}, middleware: {auth, getUserRepos}} = dependencies
  router = express.Router()
  return ({app, initPlugins: {sourceProviders, services}}) ->
    for sourceProvider in sourceProviders
      sourceProvider.registerEndpoints(router)

    for service in services
      service.registerEndpoints(router)

    app.use '/plugins', router
