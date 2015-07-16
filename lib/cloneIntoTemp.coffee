module.exports = (dependencies) ->
  {packages: {temp, child_process}} = dependencies
  return (cloneUrl, callback) ->
    console.log temp
    tempPath = temp.mkdirSync('todobot')
    console.log tempPath
    child_process.exec "git clone #{cloneUrl} #{tempPath}", (err, stdout) ->
      callback err, tempPath
