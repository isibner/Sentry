sourceProviders = ['sentry-source-github', 'sentry-source-airship']
services = ['sentry-cruft-service', 'sentry-service-github-todo-issues']

module.exports = (dependencies) ->
  {packages: {lodash: _}, config} = dependencies
  return {
    sourceProviders: _.map sourceProviders, (provider) -> return (require provider)
    services: _.map services, (plugin) -> return (require plugin)
  }
