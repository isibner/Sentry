module.exports = (dependencies) ->
  {packages: {express, del, lodash: _}, middleware: {auth}, lib: {db, repoPathFor, cloneInto}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    sendErr = (res, msg) ->
      res.send {error: msg}

    # TODO change to PUT for ajax goodness
    router.get '/activate/:sourceProviderName/:repoId', (req, res) ->
      {sourceProviderName, repoId} = req.params
      userId = req.user._id

      ActiveRepo.findOne {repoId, sourceProviderName, userId}, (err, activeRepo) ->
        return sendErr(res, err.message) if err
        return sendErr(res, 'That repo is already active.') if activeRepo?
        sourceProvider = _.findWhere initPlugins.sourceProviders, {NAME: sourceProviderName}
        sourceProvider.activateRepo req.user, repoId, (err) ->
          return sendErr(res, err.message) if err
          newActiveRepo = new ActiveRepo {repoId, sourceProviderName, userId}
          newActiveRepo.save (err, activeRepoWithId) ->
            return sendErr(res, err.message) if err
            repoPath = repoPathFor activeRepoWithId
            cloneUrl = sourceProvider.cloneUrl(req.user, activeRepoWithId)
            cloneInto {repoPath, cloneUrl}, (err) ->
              return sendErr(res, err.message) if err
              res.send {success: 'Successfully activated repository.'}

    router.get '/deactivate/:sourceProviderName/:repoId', (req, res, next) ->
      {sourceProviderName, repoId} = req.params
      userId = req.user._id

      ActiveRepo.findOne {repoId, sourceProviderName, userId}, (err, activeRepo) ->
        return sendErr(res, err.message) if err
        return sendErr(res, 'That repo is not active.') if not activeRepo?
        sourceProvider = _.findWhere initPlugins.sourceProviders, {NAME: sourceProviderName}
        sourceProvider.deactivateRepo req.user, req.params.repoId, (err) ->
          return sendErr(res, err.message) if err
          ActiveRepo.findOneAndRemove {repoId, sourceProviderName, userId}, (err, removedRepo) ->
            repoPath = repoPathFor removedRepo
            del.sync [repoPath]
            return sendErr(res, err.message) if err
            res.send {success: 'Deactivated repository.'}

    app.use '/repos', router
