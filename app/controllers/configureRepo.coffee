module.exports = (dependencies) ->
  {packages: {express, yamljs, lodash: _}, middleware: {auth}, lib: {db}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  router = express.Router()
  return ({app, initPlugins}) ->
    router.use auth.ensureAuthenticated

    flashErrorToDashboard = (req, res, msg) ->
      req.flash 'error', msg
      res.redirect '/dashboard'

    router.post '/:sourceName/:repoId', (req, res, next) ->
      {repoId, sourceName} = req.params
      ActiveRepo.findOne {repoId, sourceName, userId: req.user._id}, (err, activeRepo) ->
        flashErrorToDashboard(req, res, err.message) if err
        flashErrorToDashboard(req, res, 'That repo is not active!') if not activeRepo?
        try
          activeRepo.configObject = JSON.parse(req.body.configString)
        catch parseError
          res.locals.errorFlashes = ['Error parsing JSON - ' + parseError.message ]
          res.locals.hasFlashes = true
          return res.render 'configureRepo', {configString: req.body.configString}
        activeRepo.markModified('configObject')
        activeRepo.save (saveError) ->
          return next(saveError) if saveError
          req.flash 'success', 'Config updated'
          res.redirect '/dashboard'

    router.get '/:sourceName/:repoId', (req, res) ->
      {repoId, sourceName} = req.params
      ActiveRepo.findOne {repoId, sourceName, userId: req.user._id}, (err, activeRepo) ->
        flashErrorToDashboard(req, res, err.message) if err
        flashErrorToDashboard(req, res, 'That repo is not active!') if not activeRepo?
        res.render 'configureRepo', {configString: JSON.stringify(activeRepo.configObject, null, 2)}

    app.use '/configureRepo', router
