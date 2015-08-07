module.exports = (dependencies) ->
  {packages: {child_process, mkdirp}} = dependencies
  return ({repoPath, cloneUrl, gitCommand}, callback) ->
    mkdirp.sync repoPath
    command = "#{gitCommand} clone #{cloneUrl} #{repoPath} && cd #{repoPath} && #{gitCommand} fetch --all && #{gitCommand} pull --all"
    child_process.exec command, callback
