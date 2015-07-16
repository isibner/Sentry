# Example service. It extends EventEm
class ExampleService extends require('events').EventEmitter


  # Construct a new ExampleService.
  # @param {Object} options The options hash for this object
  # @param options {Object} config The configuration object for this instance of TodoBot.
  #   This includes server config, plugins config, and any other config files you add.
  # @param {Object} packages The packages for the parent TodoBot instance, which should include those
  #   specified as peerDependencies for this module.
  # @param {Object} db The Mongoose connection object used by TodoBot. Register your models on this.
  # @param {Object} sourceProviders The initialized SourceProviders plugged into TodoBot. Can be useful
  #   for determining whether or not this plugin is authenticated.
  constructor: ({@config, @packages, @db, @sourceProviders}) ->

    # The name of your service, in kebab-case.
    @NAME = 'example-service'

    # The user will see this name when adding this service to repos.
    @DISPLAY_NAME = 'Example Service'

    # The icon file for this service, as an absolute path - or `null` if there's no icon.
    @ICON_FILE_PATH = __dirname + '/path/to/the/icon.png'

    # The initial endpoint to hit in order to authenticate this service provider, relative to '/plugins/services/{@NAME}'.
    # This endpoint *must* be registered in initializeAuthEndpoints().
    # May be null if this service provider expects to be manually configured; in this case,
    # isAuthenticated() should always return true.
    @INITIAL_AUTH_ENDPOINT = '/auth'

  # Is the given request authenticated for this service?
  # @param {Object} req The request object that may or may not be authenticated.
  #   req.user will contain the Mongoose model for the user.
  # @return {Boolean} True, if the request is authenticated.
  isAuthenticated: ->

  # Initialize the required auth endpoints for this service, mounted at /plugins/services/{@NAME}.
  # NB: It's recommended that you save any necessary access tokens on req.user.pluginData.#{@NAME}, so you
  # can easily access it later.
  # @param {Object} router The express router which will be mounted at /plugins/services/{@NAME}
  initializeAuthEndpoints: (router) ->

  initializeOtherEndpoints: (router) ->

  activateServiceForRepo: (user, repoId, sourceProviderName, repoConfigObject, callback) ->

  handleInitialRepoData: (user, repoId, sourceProviderName, repoConfigObject, repoData, callback) ->

  handleHookRepoData: (user, repoId, sourceProviderName, repoConfigObject, repoData, callback) ->

  deactivateServiceForRepo: (user, repoId, sourceProviderName, repoConfigObject, callback) ->


