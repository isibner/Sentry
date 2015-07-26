module.exports = (dependencies) ->
  {packages: {child_process, mkdirp}, lib: {repoPathFor}} = dependencies
  return ({repoPath, cloneUrl, gitCommand}, callback) ->
    mkdirp.sync repoPath
    child_process.exec "#{gitCommand} clone #{cloneUrl} #{repoPath} && cd #{repoPath} && #{gitCommand} fetch", callback
