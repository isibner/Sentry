module.exports = (dependencies) ->
  {packages: {lodash: _, express, async}, middleware: {auth}, lib: {getActiveStatusForRepo}} = dependencies
  router = express.Router()
  return ({app, initPlugins}) ->
    # Peg source provider data to request
    router.use '/', auth.ensureAuthenticated, (req, res, next) ->
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
          sourceProvider.repoList = _.sortByOrder sourceProvider.repoList, ['NAME'], ['asc']
          _.each sourceProvider.repoList, (repoObject) ->
            inactiveServices = _.difference (_.pluck initPlugins.services, 'NAME'), repoObject.activeServices
            serviceNameToObject = (active) -> (serviceName) ->
              rawService = _.findWhere initPlugins.services, {NAME: serviceName}
              {NAME, DISPLAY_NAME, AUTH_ENDPOINT} = rawService
              return {NAME, DISPLAY_NAME, AUTH_ENDPOINT, active, isAuthenticated: rawService.isAuthenticated()}
            activeServicesAsObjects = _.map repoObject.activeServices, serviceNameToObject(true)
            inactiveServicesAsObjects = _.map inactiveServices, serviceNameToObject(false)
            repoObject.services = _.sortByOrder activeServicesAsObjects.concat(inactiveServicesAsObjects), ['DISPLAY_NAME'], ['asc']
        res.locals.sourceProviderData = mapData
        next()

    router.get '/', (req, res) -> res.render 'dashboard'

    app.use '/dashboard', router
