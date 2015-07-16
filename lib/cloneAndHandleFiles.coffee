module.exports = (dependencies) ->
  {lib: {cloneIntoTemp, getMatchingFiles}} = dependencies
  return (cloneUrl, configObject, configKey, callback) ->
    cloneIntoTemp cloneUrl, (err, tempPath) ->
      return callback(err) if err
      getMatchingFiles tempPath, configObject, configKey, callback

