sourceProviders = ['todobot-github-source']
services = ['todobot-linecounting-service']

module.exports = (dependencies) ->
  {packages: {lodash: _}, config} = dependencies
  return {
    sourceProviders: _.map sourceProviders, (provider) -> return (require provider)
    services: _.map services, (plugin) -> return (require plugin)
  }
