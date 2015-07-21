module.exports = (dependencies) ->
  {packages: {async, child_process, path, lodash: _}, lib: {repoPathFor, getMatchingFiles}} = dependencies
  return ({repo, initPlugins: {services, sourceProviders}, serviceToInitialize}, callback) ->
    repoPath = repoPathFor repo
    child_process.exec "cd #{repoPath} && git fetch", (err, stdout) ->
      return callback(err) if err
      if serviceToInitialize
        serviceName = serviceToInitialize.NAME
        getMatchingFiles {repoPath, serviceName, configObject: repo.configObject}, (err, files) ->
          return callback(err) if err
          # TODO change temppath to something just repopath; make this one arg
          serviceToInitialize.handleInitialRepoData repo, {files, tempPath: repoPath}, callback
      else
        async.each repo.activeServices, ((serviceName, eachCallback) ->
          service = _.findWhere services, {NAME: serviceName}
          getMatchingFiles {repoPath, serviceName, configObject: repo.configObject}, (err, files) ->
            return eachCallback(err) if err
            service.handleHookRepoData repo, {files, tempPath: repoPath}, eachCallback
        ), callback
