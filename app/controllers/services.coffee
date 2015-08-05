module.exports = (dependencies) ->
  {packages: {async, express, lodash: _}, middleware: {auth}, lib: {db, queueMap, repoQueueWorker}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    sendErr = (res, msg) ->
      res.send {error: msg}

    extractActiveRepo = (req, res, next) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceProviderName: req.params.sourceProviderName, userId: req.user._id}, (err, activeRepo) ->
        return next(err) if err
        return sendErr(res, 'That repo is not active.') if not activeRepo?
        req.activeRepo = activeRepo
        next()

    # TODO change to pOSt for ajax goodness
    # TODO async.waterfall()
    router.get '/activate/:sourceProviderName/:repoId/:serviceName', extractActiveRepo, (req, res, next) ->
      activeRepo = req.activeRepo
      if _.contains(activeRepo.activeServices, req.params.serviceName)
        req.flash('error', 'Service already active!')
        return res.redirect '/dashboard'
      service = _.findWhere initPlugins.services, {NAME: req.params.serviceName}
      service.activateServiceForRepo activeRepo, (activateServiceError, successMessage) ->
        next(activateServiceError) if activateServiceError
        activeRepo.activeServices.push req.params.serviceName
        activeRepo.markModified 'activeServices'
        activeRepo.save (saveError, savedActiveRepo) ->
          return sendErr(res, saveError.message) if saveError
          repoIdString = savedActiveRepo._id.toString()
          queueMap[repoIdString] ?= async.queue(repoQueueWorker, 1)
          queueMap[repoIdString].push {repo: savedActiveRepo, initPlugins, serviceToInitialize: service}, (queueProcessError) ->
            return sendErr(res, queueProcessError.message) if queueProcessError
            res.send(successMessage)

    router.get '/deactivate/:sourceProviderName/:repoId/:serviceName', extractActiveRepo, (req, res, next) ->
      service = _.findWhere initPlugins.services, {NAME: req.params.serviceName}
      activeRepo = req.activeRepo
      if not _.contains(activeRepo.activeServices, req.params.serviceName)
        req.flash('error', "Could not deactivate #{service.DISPLAY_NAME} - it was not active!")
        return res.redirect '/dashboard'
      service.deactivateServiceForRepo activeRepo, (deactivateServiceError, successMessage) ->
        next(deactivateServiceError) if deactivateServiceError
        activeRepo.activeServices = _.without activeRepo.activeServices, req.params.serviceName
        activeRepo.markModified 'activeServices'
        activeRepo.save (saveError) ->
          next(saveError) if saveError
          res.send(successMessage)

    app.use '/services', router
