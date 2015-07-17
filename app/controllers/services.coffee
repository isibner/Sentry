module.exports = (dependencies) ->
  {packages: {express, lodash: _}, middleware: {auth}, lib: {db, cloneAndHandleFiles}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

      # hookFunc = ({repoId, sourceProvider: hookSourceProvider}) ->
      #   console.log 'hookity hook hook'
      #   console.log hookSourceProvider.NAME, sourceProvider.NAME
      #   console.log repoId, activeRepo.repoId
      #   ActiveRepo.findOne
      #   console.log activeRepo.activeServices, service.NAME
      #   return if hookSourceProvider.NAME isnt sourceProvider.NAME or repoId isnt activeRepo.repoId
      #   if not _.contains activeRepo.activeServices, service.NAME
      #     return sourceProvider.removeListener 'hook', hookFunc
      #   cloneAndHandleFiles sourceProvider.cloneUrl(req.user, activeRepo), activeRepo.configObject, service.NAME, (err, files) ->
      #     service.handleHookRepoData activeRepo, files, (err) ->
      #       return console.error(err.message, err.code, err.stack) if err
      #       console.log "Handled hook data (#{sourceProvider.NAME}, #{activeRepo.repoId}, #{service.NAME}) successfully!"


    sendErr = (res, msg) ->
      res.send {error: msg}

    extractActiveRepo = (req, res, next) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceProviderName: req.params.sourceProviderName, userId: req.user._id}, (err, activeRepo) ->
        return next(err) if err
        return sendErr(res, 'That repo is not active.') if not activeRepo?
        req.activeRepo = activeRepo
        next()

    # TODO change to pOSt for ajax goodness
    router.get '/activate/:sourceProviderName/:repoId/:serviceName', extractActiveRepo, (req, res, next) ->
      activeRepo = req.activeRepo
      if _.contains(activeRepo.activeServices, req.params.serviceName)
        req.flash('error', 'Service already active!')
        return res.redirect '/dashboard'
      service = _.findWhere initPlugins.services, {NAME: req.params.serviceName}
      service.activateServiceForRepo activeRepo, (err, successMessage) ->
        next(err) if err
        activeRepo.activeServices.push req.params.serviceName
        activeRepo.markModified 'activeServices'
        activeRepo.save (err) ->
          next(err) if err
          res.send(successMessage)
        #We've sent the message; now we can go and get the initial repo data asynchronously WRT the request.
        sourceProvider = _.findWhere initPlugins.sourceProviders, {NAME: req.params.sourceProviderName}

        cloneAndHandleFiles sourceProvider.cloneUrl(req.user, activeRepo), activeRepo.configObject, service.NAME, (err, files, tempPath) ->
          return console.error(err.message, err.code, err.stack) if err
          service.handleInitialRepoData activeRepo, {files, tempPath}, (err) ->
            return console.error(err.message, err.code, err.stack) if err
            console.log "Handled initial repo data (#{sourceProvider.NAME}, #{activeRepo.repoId}, #{service.NAME}) successfully!"

    router.get '/deactivate/:sourceProviderName/:repoId/:serviceName', extractActiveRepo, (req, res, next) ->
      service = _.findWhere initPlugins.services, {NAME: req.params.serviceName}
      activeRepo = req.activeRepo
      if not _.contains(activeRepo.activeServices, req.params.serviceName)
        req.flash('error', "Could not deactivate #{service.DISPLAY_NAME} - it was not active!")
        return res.redirect '/dashboard'
      service.deactivateServiceForRepo activeRepo, (err, successMessage) ->
        next(err) if err
        activeRepo.activeServices = _.without activeRepo.activeServices, req.params.serviceName
        activeRepo.markModified 'activeServices'
        activeRepo.save (err) ->
          next(err) if err
          res.send(successMessage)

    app.use '/services', router
