module.exports = (dependencies) ->
  {packages: {mongoose}, lib: {db}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  # The actual function that retrieves repo data must be parametrized by a source provider name and a user ID
  return (sourceProviderName, userId) ->
    return ({name, id}, callback) ->
      repoId = id
      ActiveRepo.findOne {repoId, sourceProviderName, userId}, (err, activeRepo) ->
        return callback(err) if err
        if activeRepo
          callback null, {
            active: true,
            name: name,
            id: id,
            sourceProviderName: sourceProviderName,
            activeServices: activeRepo.activeServices
          }
        else
          callback null, {
            active: false,
            name: name,
            sourceProviderName: sourceProviderName,
            id: id
          }

