sourceProviders = ['todobot-github-source'] # ['todobot-github-public']
services = []# ['todobot-github-todo']

module.exports = (dependencies) ->
  {packages: {lodash: _}, config} = dependencies
  return {
    sourceProviders: _.map sourceProviders, (provider) -> return (require provider)
    services: _.map services, (plugin) -> return (require plugin)
  }
