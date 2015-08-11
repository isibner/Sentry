# Template for a Sentry service.

class ExampleService
  ###############################
  #          CONSTANTS          #
  ###############################
  # Constants should be defined on the class itself.

  # The name of your service, in kebab-case.
  @NAME = 'your_internal_service_name'

  # The user will see this name when adding this service to repos.
  @DISPLAY_NAME = 'My Service'

  # The icon file for this service, as an absolute path - or `null` if there's no icon.
  @ICON_FILE_PATH = __dirname + '/path/to/the/icon.png'

  ###
  The initial endpoint to hit in order to authenticate this service, relative to '/plugins/services/{@NAME}'.
  This endpoint *must* be registered in initializeAuthEndpoints().
  This can be null if this service expects to be manually configured; in this case,
  isAuthenticated() should always return true.
  ###
  @AUTH_ENDPOINT = '/auth'

  ###
  [OPTIONAL]
  The sources that this service can work with, or `undefined` if the service can work with
  any git source. The service will only be activated on repos that come from these sources.
  Useful for plugins that need metadata in addition to the repo files to function correctly.
  ###
  @WORKS_WITH_SOURCES: ['github', 'github-private']

  ###
  Construct a new ExampleService.
  @param {Object} options The options hash for this object.
    options.config The configuration object for this service.
      Users specify this configuration in `plugins/#{NAME}` in their Sentry instance.
    options.packages The packages for the parent Sentry server, such as Lodash and Mongoose.
    options.db The Mongoose connection object used by Sentry. Register your models on this.
    options.sources The initialized Sources plugged into Sentry. Can be useful
      if this plugin requires authentication for some repository in order to work correctly.
  ###
  constructor: ({@config, @packages, @db, @sources}) ->

  ###
  Is the given request authenticated for this service?
  @param {Object} req The request object that may or may not be authenticated.
    req.user will contain the Mongoose model for the user.
  @return {Boolean} True, if the request is authenticated.
  ###
  isAuthenticated: (req) ->

  ###
  Initialize the required auth endpoints for this service, mounted at /plugins/services/{@NAME}.
  NB: It's recommended that you save any necessary access tokens on req.user.pluginData.#{@NAME}, so you
  can easily access it later.
  @param {Object} router The express router which will be mounted at /plugins/services/{@NAME}
  ###
  initializeAuthEndpoints: (router) ->

  ###
  Initialize other endpoints that your service plans to use. These endpoints WILL require a user to be logged in to
  view them - unauthenticated users will not be able to see these endpoints. You may want to further check
  to make sure that only the owner of a repository can view it.
  @param {Object} router The express router which will be mounted at /plugins/services/{@NAME}
  ###
  initializeOtherEndpoints: (router) ->

  ###
  Initialize public endpoints for this service. These WILL NOT require a user to be logged in or even to have
  an account. Useful for providing public data about public projects.
  @param {Object} router The express router which will be mounted at /plugins/services/{@NAME}
  ###
  initializePublicEndpoints: (router) ->

  ###
  Activate this service for the given repository.
  @param {Object} options
    options.repoModel The Mongoose model representing this repository. Has `repoId`, `userId`, and `sourceName`
      as fields. It's best not to add fields and bloat this model; prefer to create your own Mongoose model to represent
      your service data.
    options.repoConfig The user-specified config for this repository. Should have the same format as the constructor's config.
  @param {Function} callback Node style callback that takes two arguments: (err, successMessage).
     `err` should contain an error, if one occurred during activation, or be null (or undefined) if no error occurred.
     `successMessage` is a String that will be flashed to the user if the activation was successful.
  ###
  activateServiceForRepo: ({repoModel, repoConfig}, callback) ->
    {repoId, userId, sourceName} = repoModel

  ###
  Handle the initial data from this repository. Some services need to know about the initial state of the repo, and run
  different code on hooks; others may delegate `handleInitialRepoData` and `handleHookRepoData` to the same function.
  @param {Object} options
    options.files {Array<String>} A list of file paths to handle, relative to `repoPath`.
    options.repoModel {Object} The Mongoose model representing this repository. Has `repoId`, `userId`, and `sourceName`
    as fields. It's best not to add fields and bloat this model; prefer to create your own Mongoose model to represent
    your service data.
    options.repoPath {String} The path of the directory in which to find the file paths in the `files` array.
    options.repoConfig The user-specified config for this repository. Should have the same format as the constructor's config.
  @param {Function} callback Node style callback that takes one argument: (err).
     `err` should contain an error, if one occurred during activation, or be null (or undefined) if no error occurred.
  ###

  handleInitialRepoData: ({files, repoModel, repoPath, repoConfig}, callback) ->
    {repoId, userId, sourceName} = repoModel
  ###
  Handle the data from a hook to this repository. Some services need to know about the initial state of the repo, and run
  different code on hooks; others may delegate `handleInitialRepoData` and `handleHookRepoData` to the same function.
  @param {Object} options
    options.files {Array<String>} A list of file paths to handle, relative to `repoPath`.
    options.repoModel {Object} The Mongoose model representing this repository. Has `repoId`, `userId`, and `sourceName`
    as fields. It's best not to add fields and bloat this model; prefer to create your own Mongoose model to represent
    your service data.
    options.repoPath {String} The path of the directory in which to find the file paths in the `files` array.
    options.repoConfig The user-specified config for this repository. Should have the same format as the constructor's config.
  @param {Function} callback Node style callback that takes one argument: (err).
     `err` should contain an error, if one occurred during activation, or be null (or undefined) if no error occurred.
  ###
  handleHookRepoData: ({files, repoModel, repoPath, repoConfig}, callback) ->
    {repoId, userId, sourceName} = repoModel

  ###
  Deactivate this service for the given repository.
  @param {Object} options
    options.repoModel The Mongoose model representing this repository. Has `repoId`, `userId`, and `sourceName`
      as fields. It's best not to add fields and bloat this model; prefer to create your own Mongoose model to represent
      your service data.
    options.repoConfig The user-specified config for this repository. Should have the same format as the constructor's config.
  @param {Function} callback Node style callback that takes two arguments: (err, successMessage).
     `err` should contain an error, if one occurred during deactivation, or be null (or undefined) if no error occurred.
     `successMessage` is a String that will be flashed to the user if the deactivation was successful.
  ###
  deactivateServiceForRepo: ({repoModel, repoConfig}, callback) ->
    {repoId, userId, sourceName} = repoModel
