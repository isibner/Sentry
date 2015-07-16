module.exports = (dependencies) ->
  {packages: {express, yamljs, lodash: _}, middleware: {auth}, lib: {db}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    flashErrorToDashboard = (res, msg) ->
      req.flash 'error', msg
      res.redirect '/dashboard'

    router.post '/:pluginName/:repoId', (req, res, next) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceProviderName: req.params.pluginName, userId: req.user._id}, (err, activeRepo) ->
        flashErrorToDashboard(res, err.message) if err
        flashErrorToDashboard(res, 'That repo is not active!') if not activeRepo?
        console.log req.body.configString
        try
          activeRepo.configObject = JSON.parse(req.body.configString)
        catch parseError
          res.locals.errorFlashes = ['Error parsing JSON - ' + parseError.message ]
          res.locals.hasFlashes = true
          return res.render 'configureRepo', {configString: req.body.configString}
        activeRepo.markModified('configObject')
        activeRepo.save (err) ->
          return next(err) if err
          req.flash 'success', 'Config updated'
          res.redirect '/dashboard'

    router.get '/:pluginName/:repoId', (req, res) ->
      ActiveRepo.findOne {repoId: req.params.repoId, sourceProviderName: req.params.pluginName, userId: req.user._id}, (err, activeRepo) ->
        flashErrorToDashboard(res, err.message) if err
        flashErrorToDashboard(res, 'That repo is not active!') if not activeRepo?
        res.render 'configureRepo', {configString: JSON.stringify(activeRepo.configObject, null, 2)}

    app.use '/configureRepo', router
