sourceProviders = ['todobot-github-source', 'todobot-github-private-source']
services = ['todobot-linecounting-service', 'sentry-cruft-service']

module.exports = (dependencies) ->
  {packages: {lodash: _}, config} = dependencies
  return {
    sourceProviders: _.map sourceProviders, (provider) -> return (require provider)
    services: _.map services, (plugin) -> return (require plugin)
  }
