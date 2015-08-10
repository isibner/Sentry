module.exports = (dependencies) ->
  {packages: {async, express, path, del, lodash: _}, middleware: {auth}, lib: {db, repoPathFor, cloneInto}, config} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    checkRepoNotActive = ({repoId, sourceProviderName, userId}) -> (callback) ->
      ActiveRepo.findOne {repoId, sourceProviderName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        return callback(new Error "Repo #{activeRepo.repoId} is already active.") if activeRepo?
        callback null

    checkRepoActive = ({repoId, sourceProviderName, userId}) -> (callback) ->
      ActiveRepo.findOne {repoId, sourceProviderName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        return callback(new Error "Repo #{activeRepo.repoId} repo is not active.") if not activeRepo?
        callback null

    getSourceProviderSync = (sourceProviderName) -> _.findWhere initPlugins.sourceProviders, {NAME: sourceProviderName}

    checkSourceProviderExists = ({sourceProviderName}) -> (callback) ->
      sourceProvider = getSourceProviderSync(sourceProviderName)
      return callback(new Error "Source provider plugin named #{sourceProviderName} does not exist.") if not sourceProvider?
      callback null

    checkUserOwnsRepo = ({sourceProviderName, repoId, userObject}) -> (callback) ->
      sourceProvider = getSourceProviderSync(sourceProviderName)
      sourceProvider.getRepositoryListForUser userObject, (err, repos) ->
        callback(err) if err?
        if not _.findWhere(repos, {id: repoId})?
          return callback(new Error "Repository #{repoId} does not exist, or you don't own it.")
        callback null

    activateRepo = ({userObject, sourceProviderName, repoId}) -> (activeRepoWithId, callback) ->
      getSourceProviderSync(sourceProviderName).activateRepo userObject, repoId, (err) -> callback(err, activeRepoWithId)

    deactivateRepo = ({userObject, sourceProviderName, repoId}) -> (callback) ->
      getSourceProviderSync(sourceProviderName).deactivateRepo userObject, repoId, (err) -> callback(err)

    addRepoToDatabase = ({repoId, sourceProviderName, userId}) -> (callback) ->
      newActiveRepo = new ActiveRepo {repoId, sourceProviderName, userId}
      newActiveRepo.save callback

    removeRepoFromDatabase = ({userId, sourceProviderName, repoId}) -> (callback) ->
      ActiveRepo.findOneAndRemove {repoId, sourceProviderName, userId}, (err, removedRepo) -> callback(err, removedRepo)

    cloneRepo = ({userObject, sourceProviderName, repoId}) -> (activeRepoWithId, numAffected, callback) ->
      sourceProvider = getSourceProviderSync(sourceProviderName)
      repoPath = repoPathFor activeRepoWithId
      cloneUrl = sourceProvider.cloneUrl(userObject, activeRepoWithId)
      sshKeypath = config[sourceProviderName]?.SSH_KEYPATH
      gitCommand = if sshKeypath? then "sh #{path.join config.server.ROOT, 'scripts/git.sh'} -i #{sshKeypath}" else 'git'
      console.log ("preparing to clone #{repoId} with command: " + gitCommand)
      cloneInto {repoPath, cloneUrl, gitCommand}, (err) -> callback(err, activeRepoWithId)

    deleteRepoFiles = (removedRepo, callback) ->
      repoPath = repoPathFor removedRepo
      del [repoPath], callback

    finishRequest = (res, success) -> (err) ->
      return res.send({error: err.message}) if err?
      res.send {success}

    router.post '/activate/:sourceProviderName/:repoId', (req, res) ->
      req.setTimeout(5 * 60 * 1000)
      {sourceProviderName, repoId} = req.params
      userId = req.user._id
      contextObject = {sourceProviderName, repoId, userId, userObject: req.user}

      async.waterfall [
        checkSourceProviderExists(contextObject),
        checkUserOwnsRepo(contextObject),
        checkRepoNotActive(contextObject),
        addRepoToDatabase(contextObject),
        cloneRepo(contextObject),
        activateRepo(contextObject)
      ], (err, activeRepoWithId) ->
        return res.send({error: err.message}) if err?
        # TODO this is used in dashboard.coffee too, it should be factored out
        inactiveServices = _.difference (_.pluck initPlugins.services, 'NAME'), activeRepoWithId.activeServices
        serviceNameToObject = (active) -> (serviceName) ->
          rawService = _.findWhere initPlugins.services, {NAME: serviceName}
          {NAME, DISPLAY_NAME, AUTH_ENDPOINT} = rawService
          return {NAME, DISPLAY_NAME, AUTH_ENDPOINT, active, sourceProviderName, repoId, isAuthenticated: rawService.isAuthenticated()}
        activeServicesAsObjects = _.map activeRepoWithId.activeServices, serviceNameToObject(true)
        inactiveServicesAsObjects = _.map inactiveServices, serviceNameToObject(false)
        # services = _.sortByOrder activeServicesAsObjects.concat(inactiveServicesAsObjects), ['DISPLAY_NAME'], ['asc']
        services = _(activeServicesAsObjects.concat(inactiveServicesAsObjects))
          .filter(({WORKS_WITH_PROVIDERS}) ->
            return not WORKS_WITH_PROVIDERS? or _.contains WORKS_WITH_PROVIDERS, sourceProviderName
          )
          .sortByOrder(['DISPLAY_NAME'], ['asc'])
          .value()
        res.send {services, success: 'Successfully activated repository.'}

    router.post '/deactivate/:sourceProviderName/:repoId', (req, res, next) ->
      {sourceProviderName, repoId} = req.params
      userId = req.user._id
      contextObject = {sourceProviderName, repoId, userId, userObject: req.user}

      async.waterfall [
        checkSourceProviderExists(contextObject),
        checkUserOwnsRepo(contextObject),
        checkRepoActive(contextObject),
        deactivateRepo(contextObject),
        removeRepoFromDatabase(contextObject),
        deleteRepoFiles
      ], finishRequest(res, 'Deactivated repository.')

    app.use '/repos', router
