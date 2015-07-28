module.exports = (dependencies) ->
  {packages: {glob, path, lodash: _}} = dependencies
  return ({repoPath, configObject, serviceName}, callback) ->
    includeFiles = configObject[serviceName]?.includeFiles || configObject.includeFiles || ['**/*']
    excludeFiles = configObject[serviceName]?.excludeFiles || configObject.excludeFiles || []
    excludeFiles.push '.git/**/*'
    matches = _.chain(includeFiles)
    .map((pattern) ->
      return glob.sync pattern, {
        nodir: true
        nonull: false
        ignore: excludeFiles
        cwd: repoPath
        root: repoPath
        dot: true
      }
    )
    .flatten()
    .uniq()
    .map((filePath) ->
      return path.join(repoPath, filePath)
    )
    .value()
    callback(null, matches)
