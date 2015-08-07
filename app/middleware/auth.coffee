module.exports =
  ensureAuthenticated: (req, res, next) ->
    return next() if req.isAuthenticated()
    req.flash 'error', 'You must be logged in to do that.'
    res.redirect('/login')
