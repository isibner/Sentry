module.exports = (dependencies) ->
  {packages: {async, child_process, path, lodash: _}, lib: {repoPathFor, getMatchingFiles}, config} = dependencies
  return ({repo, initPlugins: {services, sourceProviders}, serviceToInitialize}, callback) ->
    repoPath = repoPathFor repo
    sshKeypath = config[repo.sourceProviderName]?.SSH_KEYPATH
    gitCommand = if sshKeypath? then "sh #{path.join config.server.ROOT, 'scripts/git.sh'} -i #{sshKeypath}" else 'git'
    console.log gitCommand, repoPath
    child_process.exec "#{gitCommand} fetch --all && #{gitCommand} pull --all", {cwd: repoPath}, (err, stdout, stderr) ->
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
