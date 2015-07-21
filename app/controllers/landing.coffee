module.exports = (dependencies) ->
  {packages: {lodash: _, express, async}, middleware: {auth}, lib: {getActiveStatusForRepo}} = dependencies
  router = express.Router()
  return ({app, initPlugins}) ->
    router.get '/', (req, res) -> res.render 'index', {isIndex: true}

    router.get '/logout', (req, res) ->
      req.logout()
      req.flash 'success', 'Logged out successfully.'
      res.redirect '/'

    # Peg source provider data to request
    router.use '/dashboard', (req, res, next) ->
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
          sourceProvider.getRepositoryListForUser req.user, (err, list) ->
            return callback(err) if err
            async.map list, getActiveStatusForRepo(sourceProvider.NAME, req.user._id), (err, activeData) ->
              return callback(err) if err
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
              return {NAME: rawService.NAME, DISPLAY_NAME: rawService.DISPLAY_NAME, isAuthenticated: rawService.isAuthenticated(req), AUTH_ENDPOINT: rawService.AUTH_ENDPOINT, active: true}
            inactiveServicesAsObjects = _.map inactiveServices, (serviceName) ->
              rawService = _.findWhere initPlugins.services, {NAME: serviceName}
              return {NAME: rawService.NAME, DISPLAY_NAME: rawService.DISPLAY_NAME, isAuthenticated: rawService.isAuthenticated(req), AUTH_ENDPOINT: rawService.AUTH_ENDPOINT, active: false}
            repoObject.services = activeServicesAsObjects.concat(inactiveServicesAsObjects)
        res.locals.sourceProviderData = mapData
        next()

    router.get '/dashboard', auth.ensureAuthenticated, (req, res) -> res.render 'dashboard'

    app.use '/', router
