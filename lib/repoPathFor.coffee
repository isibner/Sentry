module.exports = (dependencies) ->
  {packages: {path, lodash: _}, config: {server: {CLONE_ROOT}}} = dependencies
  return (repo) ->
    return path.join(CLONE_ROOT, repo._id.toString())

