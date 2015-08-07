module.exports = (dependencies) ->
  {packages: {express, path, del, lodash: _}, middleware: {auth}, lib: {db, repoPathFor, cloneInto}, config} = dependencies
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

    activateRepo = ({userObject, sourceProviderName, repoId}) -> (callback) ->
      getSourceProviderSync(sourceProviderName).activateRepo userObject, repoId, (err) -> callback(err)

    deactivateRepo = ({userObject, sourceProviderName, repoId}) -> (callback) ->
      getSourceProviderSync(sourceProviderName).deactivateRepo userObject, repoId, (err) -> callback(err)

    addRepoToDatabase = ({repoId, sourceProviderName, userId}) -> (callback) ->
      newActiveRepo = new ActiveRepo {repoId, sourceProviderName, userId}
      newActiveRepo.save callback

    removeRepoFromDatabase = ({userObject, sourceProviderName, repoId}) -> (callback) ->
      ActiveRepo.findOneAndRemove {repoId, sourceProviderName, userId}, callback

    cloneRepo = ({userObject, sourceProviderName, repoId}) -> (activeRepoWithId, callback) ->
      sourceProvider = getSourceProviderSync(sourceProviderName)
      repoPath = repoPathFor activeRepoWithId
      cloneUrl = sourceProvider.cloneUrl(req.user, activeRepoWithId)
      sshKeypath = config[sourceProviderName]?.SSH_KEYPATH
      gitCommand = if sshKeypath? then "sh #{path.join config.server.ROOT, 'scripts/git.sh'} -i #{sshKeypath}" else 'git'
      console.log ("preparing to clone #{repoId} with command: " + gitCommand)
      cloneInto {repoPath, cloneUrl, gitCommand}, (err) -> callback(err)

    deleteRepoFiles = (removedRepo, callback) ->
      repoPath = repoPathFor removedRepo
      del [repoPath], callback

    finishRequest = (res, success) -> (err) ->
      return res.send({error: err.message}) if err?
      res.send {success}

    # TODO change to PUT and do some AJAX
    router.get '/activate/:sourceProviderName/:repoId', (req, res) ->
      req.setTimeout(5 * 60 * 1000)
      {sourceProviderName, repoId} = req.params
      userId = req.user._id
      contextObject = {sourceProviderName, repoId, userId, userObject: req.user}

      async.waterfall [
        checkSourceProviderExists(contextObject),
        checkRepoNotActive(contextObject),
        addRepoToDatabase(contextObject),
        cloneRepo(contextObject),
        activateRepo(contextObject)
      ], finishRequest(res, 'Successfully activated repository.')

    router.get '/deactivate/:sourceProviderName/:repoId', (req, res, next) ->
      {sourceProviderName, repoId} = req.params
      userId = req.user._id
      contextObject = {sourceProviderName, repoId, userId, userObject: req.user}

      async.waterfall [
        checkSourceProviderExists(contextObject),
        checkRepoActive(contextObject),
        deactivateRepo(contextObject),
        removeRepoFromDatabase(contextObject),
        deleteRepoFiles
      ], finishRequest(res, 'Deactivated repository.')

    app.use '/repos', router
