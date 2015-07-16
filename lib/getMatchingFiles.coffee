module.exports = (dependencies) ->
  {packages: {glob, path, lodash: _}} = dependencies
  return (tempPath, configObject, configKey, callback) ->
    includeFiles = configObject[configKey]?.includeFiles || configObject.includeFiles || ['**/*']
    excludeFiles = configObject[configKey]?.excludeFiles || configObject.excludeFiles || []
    console.log excludeFiles
    excludeFiles.push '.git/**/*'
    matches = _.chain(includeFiles)
    .map((pattern) ->
      return glob.sync pattern, {
        nodir: true
        nonull: false
        ignore: excludeFiles
        cwd: tempPath
        root: tempPath
        dot: true
      }
    )
    .flatten()
    .uniq()
    .map((filePath) ->
      return path.join(tempPath, filePath)
    )
    .value()
    callback(null, matches)
