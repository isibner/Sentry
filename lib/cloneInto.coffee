module.exports = (dependencies) ->
  {packages: {child_process, mkdirp}, lib: {repoPathFor}} = dependencies
  return ({repoPath, cloneUrl}) ->
    mkdirp.sync repoPath
    child_process.exec "git clone #{cloneUrl} #{repoPath} && cd #{repoPath} && git fetch", (err, stdout) ->
      callback err, tempPath
