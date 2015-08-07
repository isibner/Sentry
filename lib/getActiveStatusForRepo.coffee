module.exports = (dependencies) ->
  {packages: {mongoose}, lib: {db}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  # The actual function that retrieves repo data must be parametrized by a source provider name and a user ID
  return (sourceProviderName, userId) ->
    return ({name, id}, callback) ->
      repoId = id
      ActiveRepo.findOne {repoId, sourceProviderName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        if activeRepo?
          {activeServices} = activeRepo
          callback null, {name, id, sourceProviderName, activeServices, active: true}
        else
          callback null, {name, sourceProviderName, id, active: false}

