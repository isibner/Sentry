module.exports = (dependencies) ->
  {packages: {mongoose}, lib: {db}} = dependencies
  ActiveRepo = db.model('ActiveRepo')
  # The actual function that retrieves repo data must be parametrized by a source name and a user ID
  return (sourceName, userId) ->
    return ({name, id}, callback) ->
      repoId = id
      ActiveRepo.findOne {repoId, sourceName, userId}, (err, activeRepo) ->
        return callback(err) if err?
        if activeRepo?
          {activeServices} = activeRepo
          callback null, {name, id, sourceName, activeServices, active: true}
        else
          callback null, {name, sourceName, id, active: false}

