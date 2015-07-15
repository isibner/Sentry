# Example source provider. It extends EventEm
class ExampleSourceProvider extends require('events').EventEmitter

  # The name of your source provider, in kebab-case.
  @NAME = 'example-source-provider'

  # The header that the user will see the repos from this source listed under.
  @REPO_LIST_HEADER = 'Example Source'

  # The icon file for this source provider, as an absolute path - or `null` if there's no icon.
  @ICON_FILE_PATH = __dirname + '/path/to/the/icon.png'

  # The initial endpoint to hit in order to authenticate this service provider, relative to '/plugins/{@NAME}'.
  # This endpoint *must* be registered in initializeAuthEndpoints().
  # May be null if this service provider expects to be manually configured; in this case,
  # isAuthenticated() should always return true.
  @INITIAL_AUTH_ENDPOINT = '/example-service/auth'

  # The webhook endpoint that this plugin will register with its source, relative to '/plugins/{@NAME}'.
  # This endpoint should be added to activated repos as a webhook URL.
  # May be null, if this source provider for some reason does not support webhooks.
  # NB: TodoBot will not fall back to polling for changes. Let your git platform know that you want webhooks!
  @WEBHOOK_ENDPOINT = '/example-service/handle-webhook'

  # Construct a new ExampleSourceProvider.
  # @param {Object} options The options hash for this object
  # @param options {Object} config The configuration object for this instance of TodoBot.
  #   This includes server config, plugins config, and any other config files you add.
  # @param {Object} packages The packages for the parent TodoBot instance, which should include those
  #   specified as peerDependencies for this module. Also includes the parent instance of passport,
  #   which is very useful for configuring auth strategies.
  constructor: ({@config, @packages}) ->

  # Initialize the required auth endpoints for this source provider, mounted at /plugins/{@NAME}.
  # NB: It's recommended that you save any necessary access tokens on req.user, so you
  # can easily access it later.
  # @param {Object} router The express router which will be mounted at /plugins/{@NAME}
  initializeAuthEndpoints: (router) ->

  # Is the given request authenticated for this source provider?
  # @param {Object} req The request object that may or may not be authenticated.
  #   req.user will contain the Mongoose model for the user.
  # @return {Boolean} True, if the request is authenticated.
  isAuthenticated: (req) ->

  # Get a list of available repositories for the currently logged in user.
  # @param {Object} user the Mongoose model for the user
  # @param {Function} callback Node-style callback with two arguments: (err, results).
  #   Results should have type {Array<Object>}, representing info about the repos.
  #   Each object must have an `id` field, which (along with the user object) should be
  #   a unique identifier for the repo, and a `name` field, which will be used for display.
  #   Other fields are allowed and can be used by services when dealing with this SourceProvider.
  getRepositoryListForUser: (user, callback) ->

  # Activate a given repository for the user. Only called if the requesting user is authenticated.
  # NB: You should ensure that you have added a webhook with your source when you activate the repo.
  # @param {Object} user The Mongoose model for the user
  # @param {String} repoId The unique ID for this repository (from getRepositoryListForUser)
  # @param {Function} callback Node-style callback with one arguments: (err). If err is null or
  #   undefined, then we assume that the activation was a success.
  activateRepo: (user, repoId, callback) ->

  # Get the clone URL for a given repository. repoId is guaranteed to belong to an activated repo.
  # @param {Object} user The Mongoose model for the user
  # @param {String} repoId The unique ID for this repository (from getRepositoryListForUser)
  # @return {String} The clone URL for this repo.
  cloneURL: (user, repoId) ->


  # Initialize hooks that signal a change in source data for an activated repo.
  # This will most often be a webhook endpoint; you can register your hook handler on the router
  # object, relative to '/plugins/{@NAME}'. Alternatively, it could be on a cron job or something.
  # The only requirement is that you must trigger the 'hook' event with the data for the hook.
  # It's up to you to define that data in a way that makes sense for your source, but it's a good
  # idea to pass the ID of the target repository in most cases.
  # @param {Object} router The express router which will be mounted at /plugins/{@NAME}
  initializeHooks: (router) ->


  # Undo activateRepo for this repository. Only called if the requesting user is authenticated.
  # @param {Object} user The Mongoose model for the user
  # @param {String} repoId The unique ID for this repository (from getRepositoryListForUser)
  # @param {Function} callback Node-style callback with one arguments: (err). If err is null or
  #   undefined, then we assume that the repository was successfully deactivated.
  deactivateRepo: (user, repoId, callback) ->

