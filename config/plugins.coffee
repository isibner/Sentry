plugins = ['todobot-github-todo']

module.exports = (dependencies) ->
  {packages: {lodash: _}} = dependencies
  return _.map plugins, (plugin) -> return (require plugin)
