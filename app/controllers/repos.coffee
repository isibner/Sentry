module.exports = (dependencies) ->
  {packages: {async, express, path, del, lodash: _}, middleware: {auth}, lib: {db, repoPathFor, cloneInto}, config} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    checkRepoNotActive = ({repoId, sourceName, userId}) -> (callback) ->
      ActiveRepo.findOne {repoId, sourceName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        return callback(new Error "Repo #{activeRepo.repoId} is already active.") if activeRepo?
        callback null

    checkRepoActive = ({repoId, sourceName, userId}) -> (callback) ->
      ActiveRepo.findOne {repoId, sourceName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        return callback(new Error "Repo #{activeRepo.repoId} repo is not active.") if not activeRepo?
        callback null

    getSourceSync = (sourceName) -> _.findWhere initPlugins.sources, {NAME: sourceName}

    checkSourceExists = ({sourceName}) -> (callback) ->
      source = getSourceSync(sourceName)
      return callback(new Error "Source plugin named #{sourceName} does not exist.") if not source?
      callback null

    checkUserOwnsRepo = ({sourceName, repoId, userObject}) -> (callback) ->
      source = getSourceSync(sourceName)
      source.getRepositoryListForUser userObject, (err, repos) ->
        callback(err) if err?
        if not _.findWhere(repos, {id: repoId})?
          return callback(new Error "Repository #{repoId} does not exist, or you don't own it.")
        callback null

    activateRepo = ({userObject, sourceName, repoId}) -> (activeRepoWithId, callback) ->
      getSourceSync(sourceName).activateRepo userObject, repoId, (err) -> callback(err, activeRepoWithId)

    deactivateAllActiveServices = ({userId, sourceName, repoId}) -> (callback) ->
      # TODO - this is repeated in Services.coffee, should be factored out to lib/
      ActiveRepo.findOne {repoId, sourceName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        if not activeRepo?
          return callback(new Error 'Repo not found. It may be inactive or nonexistent.')
        async.each activeRepo.activeServices, ((serviceName, eachCallback) ->
          service = _.findWhere initPlugins.services, {NAME: serviceName}
          deactivationOptions = {repoModel: activeRepo, repoConfig: activeRepo.configObject?[serviceName]}
          service.deactivateServiceForRepo deactivationOptions, (deactivateErr) -> eachCallback(deactivateErr)
        ), callback

    deactivateRepo = ({userObject, sourceName, repoId}) -> (callback) ->
      getSourceSync(sourceName).deactivateRepo userObject, repoId, (err) -> callback(err)

    addRepoToDatabase = ({repoId, sourceName, userId}) -> (callback) ->
      newActiveRepo = new ActiveRepo {repoId, sourceName, userId}
      newActiveRepo.save callback

    removeRepoFromDatabase = ({userId, sourceName, repoId}) -> (callback) ->
      ActiveRepo.findOneAndRemove {repoId, sourceName, userId}, (err, removedRepo) -> callback(err, removedRepo)

    cloneRepo = ({userObject, sourceName, repoId}) -> (activeRepoWithId, numAffected, callback) ->
      source = getSourceSync(sourceName)
      repoPath = repoPathFor activeRepoWithId
      cloneUrl = source.cloneUrl(userObject, activeRepoWithId)
      sshKeypath = config[sourceName]?.SSH_KEYPATH
      gitCommand = if sshKeypath? then "sh #{path.join config.server.ROOT, 'scripts/git.sh'} -i #{sshKeypath}" else 'git'
      console.log ("preparing to clone #{repoId} with command: " + gitCommand)
      cloneInto {repoPath, cloneUrl, gitCommand}, (err) -> callback(err, activeRepoWithId)

    deleteRepoFiles = (removedRepo, callback) ->
      repoPath = repoPathFor removedRepo
      del [repoPath], callback

    finishRequest = (res, success) -> (err) ->
      return res.send({error: err.message}) if err?
      res.send {success}

    router.post '/activate/:sourceName/:repoId', (req, res) ->
      req.setTimeout(5 * 60 * 1000)
      {sourceName, repoId} = req.params
      userId = req.user._id
      contextObject = {sourceName, repoId, userId, userObject: req.user}

      async.waterfall [
        checkSourceExists(contextObject),
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
          return {NAME, DISPLAY_NAME, AUTH_ENDPOINT, active, sourceName, repoId, isAuthenticated: rawService.isAuthenticated(req)}
        activeServicesAsObjects = _.map activeRepoWithId.activeServices, serviceNameToObject(true)
        inactiveServicesAsObjects = _.map inactiveServices, serviceNameToObject(false)
        # services = _.sortByOrder activeServicesAsObjects.concat(inactiveServicesAsObjects), ['DISPLAY_NAME'], ['asc']
        services = _(activeServicesAsObjects.concat(inactiveServicesAsObjects))
          .filter(({WORKS_WITH_SOURCES}) ->
            return not WORKS_WITH_SOURCES? or _.contains WORKS_WITH_SOURCES, sourceName
          )
          .sortByOrder(['DISPLAY_NAME'], ['asc'])
          .value()
        res.send {services, success: 'Successfully activated repository.'}

    router.post '/deactivate/:sourceName/:repoId', (req, res, next) ->
      {sourceName, repoId} = req.params
      userId = req.user._id
      contextObject = {sourceName, repoId, userId, userObject: req.user}

      async.waterfall [
        checkSourceExists(contextObject),
        checkUserOwnsRepo(contextObject),
        checkRepoActive(contextObject),
        deactivateAllActiveServices(contextObject),
        deactivateRepo(contextObject),
        removeRepoFromDatabase(contextObject),
        deleteRepoFiles
      ], finishRequest(res, 'Deactivated repository.')

    app.use '/repos', router
