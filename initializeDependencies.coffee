_ = require 'lodash'
path = require 'path'
glob = require 'glob'

removeExtension = (filePath) ->
  extension = path.extname(filePath)
  return filePath.substring(0, filePath.length - extension.length)

dependencies = {}
# Packages are the base; they obviously must stand alone
builtins = ['fs', 'path', 'url', 'child_process']
fromPackageJson = Object.keys (require './package.json').dependencies
dependencies.packages =
  _.chain(builtins.concat fromPackageJson)
  .map((packageName) -> [packageName, packageName])
  .zipObject()
  .mapValues((packageName) -> require(packageName))
  .value()


# Next comes /config, which should have no deps other than the packages
configDir = path.join __dirname, 'config/'
configPaths = glob.sync(path.join configDir, '**/*.coffee')
dependencies.config =
  _.chain(configPaths)
  .map((fileName) -> [fileName, fileName])
  .zipObject()
  .mapValues((fileName) -> require(fileName)(dependencies))
  .mapKeys((value, fileName) -> removeExtension path.relative(configDir, fileName))
  .value()

# Next models, which can depend on config and packages
modelsDir = path.join __dirname, 'app/models/'
modelPaths = glob.sync(path.join modelsDir, '*.coffee')
dependencies.models =
  _.chain(modelPaths)
  .map((fileName) -> [fileName, fileName])
  .zipObject()
  .mapValues((fileName) -> require(fileName)(dependencies))
  .mapKeys((value, fileName) -> _.capitalize(removeExtension(path.relative(modelsDir, fileName))))
  .value()

# Lib is tricky; lib files can depend on one another.
# Toposort seems like overkill for this scale; so we'll use a magic JSON file instead.
# We'll also load files that aren't specified after those that are (in undefined order).
libDir = path.join __dirname, 'lib/'
specifiedFiles = (require './lib/loadOrder.json').map (filename) ->
  return path.join libDir, filename
unspecifiedFiles = _.difference glob.sync(path.join libDir, '**/*.coffee'), specifiedFiles
dependencies.lib = {}
_.forEach (specifiedFiles.concat unspecifiedFiles), (file) ->
  packageName = removeExtension(path.relative libDir, file)
  dependencies.lib[packageName] = require(file)(dependencies)

# Next middleware, which shouldn't depend on one another
middlewareDir = path.join __dirname, 'app/middleware/'
middlewarePaths = glob.sync(path.join middlewareDir, '**/*.coffee')
dependencies.middleware =
  _.chain(middlewarePaths)
  .map((fileName) -> [fileName, fileName])
  .zipObject()
  .mapValues((fileName) -> require(fileName)(dependencies))
  .mapKeys((value, fileName) -> removeExtension path.relative(middlewareDir, fileName))
  .value()

# Almost done. Next, controllers, which can depend on anything else but not other controllers.
# NB: Controllers are NOT initialized here, since they must be initialized with the app in the final step; order matters to Express middleware.
controllerDir = path.join __dirname, 'app/controllers/'
controllerPaths = glob.sync(path.join controllerDir, '**/*.coffee')
dependencies.controllers =
  _.chain(controllerPaths)
  .map((fileName) -> [fileName, fileName])
  .zipObject()
  .mapValues((fileName) -> require(fileName)(dependencies))
  .mapKeys((value, fileName) -> removeExtension path.relative(controllerDir, fileName))
  .value()

# Finally, top-level app files. This should just be app initialization code.
appDir = path.join __dirname, 'app/'
appPaths = glob.sync(path.join appDir, '/*.coffee')
dependencies.appInitializers =
  _.chain(appPaths)
  .map((fileName) -> [fileName, fileName])
  .zipObject()
  .mapValues((fileName) -> require(fileName)(dependencies))
  .mapKeys((value, fileName) -> removeExtension path.relative(appDir, fileName))
  .value()

module.exports = dependencies
