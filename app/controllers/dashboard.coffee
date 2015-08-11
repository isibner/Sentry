module.exports = (dependencies) ->
  {packages: {lodash: _, express, async}, middleware: {auth}, lib: {getActiveStatusForRepo}} = dependencies
  router = express.Router()
  return ({app, initPlugins}) ->

    router.use '*', auth.ensureAuthenticated

    router.get '/', (req, res) -> res.render 'dashboard'

    router.get '/data', (req, res) ->
      async.map initPlugins.sources, ((source, callback) ->
        data =
          name: source.NAME
          displayName: source.DISPLAY_NAME
          isAuthenticated: source.isAuthenticated(req)
          authEndpoint: "/plugins/sources/#{source.NAME}/" + _.trimLeft(source.AUTH_ENDPOINT, '/')
          iconURL: "/plugins/sources/#{source.NAME}/icon"
        if not data.isAuthenticated
          callback(null, data)
        else
          source.getRepositoryListForUser req.user, (sourceError, list) ->
            return callback(sourceError) if sourceError?
            async.map list, getActiveStatusForRepo(source.NAME, req.user._id), (getRepoActiveStatusError, activeData) ->
              return callback(getRepoActiveStatusError) if getRepoActiveStatusError?
              data.repoList = activeData
              callback(null, data)
      ), (mapError, mapData) ->
        res.status(500).send {error: mapError.toString()} if mapError?
        _.each mapData, (source) ->
          source.repoList = _.sortByOrder source.repoList, ['NAME'], ['asc']
          _.each source.repoList, (repoObject) ->
            inactiveServices = _.difference (_.pluck initPlugins.services, 'NAME'), repoObject.activeServices
            serviceNameToObject = (active) -> (serviceName) ->
              rawService = _.findWhere initPlugins.services, {NAME: serviceName}
              {NAME, DISPLAY_NAME, AUTH_ENDPOINT, WORKS_WITH_SOURCES} = rawService
              return {NAME, DISPLAY_NAME, AUTH_ENDPOINT, WORKS_WITH_SOURCES, active, isAuthenticated: rawService.isAuthenticated(), sourceName: source.name, repoId: repoObject.id}
            activeServicesAsObjects = _.map repoObject.activeServices, serviceNameToObject(true)
            inactiveServicesAsObjects = _.map inactiveServices, serviceNameToObject(false)
            repoObject.services = _(activeServicesAsObjects.concat(inactiveServicesAsObjects))
              .filter(({sourceName, WORKS_WITH_SOURCES}) ->
                return not WORKS_WITH_SOURCES? or _.contains WORKS_WITH_SOURCES, sourceName
              )
              .sortByOrder(['DISPLAY_NAME'], ['asc'])
              .value()

        res.status(200).send(mapData)


    app.use '/dashboard', router
