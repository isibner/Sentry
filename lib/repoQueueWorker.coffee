module.exports = (dependencies) ->
  {packages: {async, child_process, path, lodash: _}, lib: {repoPathFor, getMatchingFiles}} = dependencies
  return ({repo, initPlugins: {services, sourceProviders}, isInitial}, callback) ->
    repoPath = repoPathFor repo
    child_process.exec "cd #{repoPath} && git fetch", (err, stdout) ->
      callback(err) if err
      async.each activeRepo.activeServices, ((serviceName, eachCallback) ->
        service = _.findWhere initPlugins.services, {NAME: serviceName}
        getMatchingFiles {repoPath, serviceName, configObject: repo.configObject}, (err, files) ->
          return eachCallback(err) if err
          if isInitial
            # TODO change temppath to something just repopath; make this one arg
            service.handleInitialRepoData repo, {files, tempPath: repoPath}, eachCallback
          else
            service.handleHookRepoData repo, {files, tempPath: repoPath}, eachCallback
      ), callback
