module.exports = (dependencies) ->
  {packages: {express}, middleware: {auth}} = dependencies
  router = express.Router()
  return (app) ->
    router.get '/github', auth.github, auth.noop
    router.get '/github/callback', auth.githubCallback, auth.githubCallbackResolution
    app.use '/auth', router
