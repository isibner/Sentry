# Template for a Sentry source provider.

# Source providers must extend Events.EventEmitter in order to emit 'hook' events when source provider repositories are changed.
class ExampleSourceProvider extends require('events').EventEmitter

  # Construct a new ExampleSourceProvider.
  # @param {Object} options The options hash for this object.
  # @param {Object} options.config The configuration object for this instance of Sentry.
  #   This includes server config, plugins config, and any other config files you add.
  #   If your source provider has a user config file, it will be passed as `config[@NAME]`, where @NAME
  #   is the internal name of this class (specified below).
  # @param {Object} packages The packages for the parent Sentry server, such as Lodash and Mongoose.
  constructor: ({@config, @packages}) ->
    ###############################
    #~~~~~~~~~ CONSTANTS ~~~~~~~~~#
    ###############################
    # Constants should be defined on the class instance in the constructor.

    # The name of your source provider, in kebab-case.
    @NAME = 'your_internal_source_provider_name'

    # The header that the user will see the repos from this source listed under.
    @DISPLAY_NAME = 'Your Source Provider Display Name'

    # The icon file for this source provider, as an absolute path - or `null` if there's no icon.
    @ICON_FILE_PATH = __dirname + '/path/to/the/icon.png'

    # The initial endpoint to hit in order to authenticate this service provider, relative to '/plugins/source-providers/{@NAME}'.
    # This endpoint *must* be registered in initializeAuthEndpoints().
    # This can be null if this service provider expects to be manually configured; in this case,
    # isAuthenticated() should always return true.
    @AUTH_ENDPOINT = '/auth'

  # Initialize the required auth endpoints for this source provider, mounted at /plugins/source-providers/{@NAME}.
  # NB: req.user is a Mongoose model. If your auth returns an access token or other identifier, it may be a good idea
  # to save this token as key on `req.user.pluginData[@NAME]`. Note also that you must use `req.user.markModified('pluginData')`,
  # or the model will save incorrectly.
  # @param {Object} router The express router, which will be mounted at /plugins/source-providers/{@NAME}
  initializeAuthEndpoints: (router) ->

  # Is the given request authenticated for this source provider?
  # @param {Object} req The request object that may or may not be authenticated.
  #   req.user will be the Mongoose model for the user.
  # @return {Boolean} true, if the request is authenticated.
  isAuthenticated: (req) ->

  # Get a list of available repositories for the currently logged in user.
  # @param {Object} user the Mongoose model for the user
  # @param {Function} callback Node-style callback with two arguments: (err, results).
  #   Results should have type {Array<Object>}, representing info about the repos.
  #   Each object must have an `id` field, which MUST be a globally unique identifier for the repo, and a `name` field,
  #   which will be used for display. The object will be passed directly to services registered on the repo,
  #   so you can also add other fields to be used by specialized services when dealing with this SourceProvider.
  getRepositoryListForUser: (user, callback) ->

  # Activate a given repository for the user. Only called if the requesting user is authenticated.
  # If you plan to listen for webhooks, ensure that you have added themto your git service when you activate the repo.
  # @param {Object} user The Mongoose model for the user
  # @param {String} repoId The unique ID for this repository (from getRepositoryListForUser)
  # @param {Function} callback Node-style callback with one argument: (err). Err should be null or
  #   undefined only when the activation was a success.
  activateRepo: (user, repoId, callback) ->

  # Initialize hooks that signal a change in source data for an activated repo. This will most often be a webhook endpoint.
  # You can register your hook handler on the router object, which will be mounted at '/plugins/source-providers/{@NAME}'.
  # You can use something other than webhooks to trigger the change, like set up a cron job to trigger the services ever few minutes.
  #
  # In order to signal a change, you must trigger the 'hook' event with a data object that contains the repoId for this hook
  # under the `repoId` key - e.g. `@emit 'hook', {repoId: req.body.repository.full_name}`
  # The object will be passed to services handling hooks for your source provider; you add any other fields you like to the data
  # object in order to pass relevant information to services specialized for this git source.
  # @param {Object} router The express router for any webhooks, which will be mounted at /plugins/source-providers/{@NAME}
  initializeHooks: (router) ->

  # Get the clone URL for a given repository. `repoId` is guaranteed to belong to an activated repo.
  # @param {Object} user The Mongoose model for the user
  # @param {String} repoId The unique ID for this repository (from getRepositoryListForUser)
  # @return {String} The clone URL for this repo.
  cloneURL: (user, repoId) ->

  # Undo activateRepo for this repository. Only called if the requesting user is authenticated.
  # @param {Object} user The Mongoose model for the user
  # @param {String} repoId The unique ID for this repository (from getRepositoryListForUser)
  # @param {Function} callback Node-style callback with one arguments: (err). If err is null or
  #   undefined, then we assume that the repository was successfully deactivated.
  deactivateRepo: (user, repoId, callback) ->
