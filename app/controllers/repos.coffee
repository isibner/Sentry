module.exports = (dependencies) ->
  {packages: {express, lodash: _}, middleware: {auth}, lib: {db}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    sendErr = (res, msg) ->
      res.send {error: msg}

    # TODO change to PUT for ajax goodness
    router.get '/activate/:pluginName/:repoId', (req, res) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceProviderName: req.params.pluginName, userId: req.user._id}, (err, activeRepo) ->
        return sendErr(res, err.message) if err
        return sendErr(res, 'That repo is already active.') if activeRepo?
        plugin = _.findWhere initPlugins.sourceProviders, {NAME: req.params.pluginName}
        plugin.activateRepo req.user, req.params.repoId, (err) ->
          sendErr(res, err.message) if err
          newActiveRepo = new ActiveRepo {repoId: req.params.repoId, sourceProviderName: req.params.pluginName, userId: req.user._id}
          newActiveRepo.save (err) ->
            sendErr(res, err.message) if err
            res.send {success: 'Successfully activated repository.'}


    router.get '/deactivate/:pluginName/:repoId', (req, res, next) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceProviderName: req.params.pluginName, userId: req.user._id}, (err, activeRepo) ->
        return sendErr(res, err.message) if err
        return sendErr(res, 'That repo is not active.') if not activeRepo?
        plugin = _.findWhere initPlugins.sourceProviders, {NAME: req.params.pluginName}
        plugin.deactivateRepo req.user, req.params.repoId, (err) ->
          sendErr(res, err.message) if err
          ActiveRepo.findOneAndRemove {repoId: req.params.repoId, sourceProviderName: req.params.pluginName, userId: req.user._id}, (err) ->
            sendErr(res, err.message) if err
            res.send {success: 'Deactivated repository.'}

    app.use '/repos', router
