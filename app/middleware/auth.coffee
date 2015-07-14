module.exports = (dependencies) ->
  {packages: {passport}} = dependencies
  return {
    github: passport.authenticate('github', {scope: 'repo, admin:repo_hook'})
    githubCallback: passport.authenticate 'github', {
      failureRedirect: '/login',
      scope: 'repo, admin:repo_hook'
    }
    githubCallbackResolution: (req, res) -> res.redirect('/')
    ensureAuthenticated: (req, res) ->
      return next if req.isAuthenticated()
      res.redirect('/login')
    noop: ->
  }

