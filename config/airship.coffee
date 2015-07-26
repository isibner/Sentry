module.exports = (dependencies) ->
  {packages: {path}} = dependencies
  root = path.join __dirname, '..'
  return {
    SSH_KEYPATH: '~/.ssh/sentry_rsa'
  }
