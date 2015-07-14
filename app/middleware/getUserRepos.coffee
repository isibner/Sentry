module.exports = (dependencies) ->
  {packages: {lodash: _}} = dependencies
  return (req, res, next) ->
    req.user.findOwnRepos (err, repos) ->
      return next(err) if err
      res.locals.userRepos = _.map repos, (repo) ->
        if req.user.repos
          repoNames = _.pluck req.user.repos, 'name'
          if repoNames.indexOf(repo.name) isnt -1
            repo.todoBotActive = true
        return repo
      next()
