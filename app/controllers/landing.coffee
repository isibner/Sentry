module.exports = (dependencies) ->
  {packages: {lodash: _, express, async}, middleware: {auth}, lib: {getActiveStatusForRepo}} = dependencies
  router = express.Router()
  return ({app, initPlugins}) ->
    router.get '/', (req, res) ->
      res.render 'index', {isIndex: true}

    router.get '/logout', (req, res) ->
      req.logout()
      req.flash 'success', 'Logged out successfully.'
      res.redirect '/'

    # TODO: Move /dashboard into another file
    # Peg source provider data to request
    router.use '/dashboard', auth.ensureAuthenticated, (req, res, next) ->
      async.map initPlugins.sourceProviders, ((sourceProvider, callback) ->
        data =
          name: sourceProvider.NAME
          displayName: sourceProvider.DISPLAY_NAME
          isAuthenticated: sourceProvider.isAuthenticated(req)
          authEndpoint: "/plugins/source-providers/#{sourceProvider.NAME}/" + _.trimLeft(sourceProvider.AUTH_ENDPOINT, '/')
          iconURL: "/plugins/source-providers/#{sourceProvider.NAME}/icon"
        if not data.isAuthenticated
          callback(null, data)
        else
          sourceProvider.getRepositoryListForUser req.user, (sourceProviderError, list) ->
            return callback(sourceProviderError) if sourceProviderError?
            async.map list, getActiveStatusForRepo(sourceProvider.NAME, req.user._id), (getRepoActiveStatusError, activeData) ->
              return callback(getRepoActiveStatusError) if getRepoActiveStatusError?
              data.repoList = activeData
              callback(null, data)
      ), (mapError, mapData) ->
        return next(mapError) if mapError
        _.each mapData, (sourceProvider) ->
          sourceProvider.repoList = _.sortByOrder sourceProvider.repoList, ['active'], ['desc']
          _.each sourceProvider.repoList, (repoObject) ->
            inactiveServices = _.difference (_.pluck initPlugins.services, 'NAME'), repoObject.activeServices
            activeServicesAsObjects = _.map repoObject.activeServices, (serviceName) ->
              rawService = _.findWhere initPlugins.services, {NAME: serviceName}
              # TODO: Refactor so these lines aren't so INSANELY LONG
              return {NAME: rawService.NAME, DISPLAY_NAME: rawService.DISPLAY_NAME, isAuthenticated: rawService.isAuthenticated(req), AUTH_ENDPOINT: rawService.AUTH_ENDPOINT, active: true}
            inactiveServicesAsObjects = _.map inactiveServices, (serviceName) ->
              rawService = _.findWhere initPlugins.services, {NAME: serviceName}
              return {NAME: rawService.NAME, DISPLAY_NAME: rawService.DISPLAY_NAME, isAuthenticated: rawService.isAuthenticated(req), AUTH_ENDPOINT: rawService.AUTH_ENDPOINT, active: false}
            repoObject.services = activeServicesAsObjects.concat(inactiveServicesAsObjects)
        res.locals.sourceProviderData = mapData
        next()

    router.get '/dashboard', (req, res) -> res.render 'dashboard'

    app.use '/', router
