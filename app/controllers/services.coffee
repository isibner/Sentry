module.exports = (dependencies) ->
  {packages: {async, express, lodash: _}, middleware: {auth}, lib: {db, queueMap, repoQueueWorker}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    sendErr = (res, err) ->
      console.error(err)
      error = err.message || err
      res.send {error}

    extractActiveRepo = (req, res, next) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceName: req.params.sourceName, userId: req.user._id}, (err, activeRepo) ->
        return next(err) if err
        if not activeRepo?
          res.status(404)
          return sendErr(res, 'Repo not found. It may be inactive or nonexistent.')
        req.activeRepo = activeRepo
        next()

    router.post '/activate/:sourceName/:repoId/:serviceName', extractActiveRepo, (req, res, next) ->
      activeRepo = req.activeRepo
      {sourceName, serviceName} = req.params
      if _.contains(activeRepo.activeServices, serviceName)
        return sendErr(res, new Error('Service already active.'))
      service = _.findWhere initPlugins.services, {NAME: serviceName}
      activationOptions = {repoModel: activeRepo, repoConfig: activeRepo.configObject?[serviceName]}
      service.activateServiceForRepo activationOptions, (activateServiceError, successMessage) ->
        return sendErr(res, activateServiceError) if activateServiceError?
        activeRepo.activeServices.push serviceName
        activeRepo.markModified 'activeServices'
        activeRepo.save (saveError, savedActiveRepo) ->
          return sendErr(res, saveError) if saveError?
          repoIdString = savedActiveRepo._id.toString()
          queueMap[repoIdString] ?= async.queue(repoQueueWorker, 1)
          queueMap[repoIdString].push {repo: savedActiveRepo, initPlugins, serviceToInitialize: service}, (queueProcessError) ->
            return sendErr(res, queueProcessError) if queueProcessError?
            res.send({success: successMessage || 'Successfully activated service.'})

    router.post '/deactivate/:sourceName/:repoId/:serviceName', extractActiveRepo, (req, res, next) ->
      activeRepo = req.activeRepo
      {sourceName, serviceName} = req.params
      if not _.contains(activeRepo.activeServices, serviceName)
        return sendErr(res, new Error("Could not deactivate #{service.DISPLAY_NAME} - it was not active."))
      service = _.findWhere initPlugins.services, {NAME: serviceName}
      deactivationOptions = {repoModel: activeRepo, repoConfig: activeRepo.configObject?[serviceName]}
      service.deactivateServiceForRepo deactivationOptions, (deactivateServiceError, successMessage) ->
        return sendErr(res, deactivateServiceError) if deactivateServiceError?
        activeRepo.activeServices = _.without activeRepo.activeServices, serviceName
        activeRepo.markModified 'activeServices'
        activeRepo.save (saveError) ->
          return sendErr(res, saveError) if saveError?
          res.send({success: successMessage || 'Successfully deactivated service.'})

    app.use '/services', router
