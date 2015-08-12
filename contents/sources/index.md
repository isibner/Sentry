---
title: Source API
template: markdown.html
---

# Writing Sentry Sources

By writing a Sentry source, you can integrate your favorite Git source with Sentry. This allows you to track your code even
when it's on a privately-hosted Git services like Stash. If your service of choice supports OAuth, your source
can use that to authenticate.

At its core, a Sentry source is just an NPM module that exposes a source class. So all the normal rules of Node apply -
you can have other modules as dependencies, make helper files, and so on. At a minimum though, a bare-bones sentry source needs
three things: a `package.json` file, a source class (which will be the module's export), and an icon file.

```
sentry-source-awesome
├── icon.png
├── index.js
└── package.json
```

## `package.json`

This is just a regular old package.json file, for the most part; see [the npm docs](https://docs.npmjs.com/files/package.json)
if you're unfamiliar. There are only a few best practices to note here:

* Your package name should follow the format `sentry-source-YOUR-SOURCE-NAME`. This makes it easy for others to see your source
name at a glance. Note that your source name should be in kebab-case.
* Sentry already provides many of the dependencies you're likely to use, so you can put them in `peerDependencies`. In particular,
if you want to use [handlebars](https://github.com/wycats/handlebars.js) or [passport](https://github.com/jaredhanson/passport),
these should go in `peerDependencies` so you get the same instance as Sentry.
* If you're publishing to NPM, the keywords for your package should include `"sentry"`, `"source"`, and your source's name.

## `icon.png`

A square icon that Sentry will use to display your source in the UI. 128x128 is a good size.

## `index.js`

This is what your NPM module exposes - a class representing your Sentry source.It is **highly recommended**, though not required, that you implement this class in CoffeeScript, then compile it into a `.js` file.

The best way to write a simple source is to copy [this template source](https://github.com/isibner/sentry/blob/master/docs/SourceTemplate.coffee) into your own project and fill in the method stubs. You can also check [the list of existing sources](https://github.com/isibner/sentry/#sources) for working examples.

# One-off sources

Sometimes, you want to write a Sentry source that just encapsulates a few repositories, or even a single repository. Maybe you're working on a team at a large company <!-- cough PALANTIR cough -->and your code is all in one Atlassian Stash repo. For cases like this, it's usually easiest to write a one-off source like the one below (which works for Stash and monitors the `develop` branch).

```coffeescript
_ = require 'lodash'
path = require 'path'

class OneOffSource extends require('events').EventEmitter
  @NAME: 'one-off-source'
  @DISPLAY_NAME: 'One Off Source'
  @ICON_FILE_PATH: path.join(__dirname, '../', 'stash.png')
  @AUTH_ENDPOINT: null

  constructor: ({@config, @packages}) ->

  initializeAuthEndpoints: (router) ->

  isAuthenticated: (req) -> true

  getRepositoryListForUser: (user, callback) ->
    callback null, [{id: 'my-one-off-source', name: 'The One Repo'}]

  activateRepo: (userModel, repoId, callback) -> callback()

  cloneUrl: (userModel, repoModel) -> return 'ssh://git@host.com/myrepo/hindenburg.git'

  initializeHooks: (router) ->
    router.post '/webhook', (req, res) =>
      if req.body?.refChanges?[0].refId is 'refs/heads/develop' and req.body?.refChanges?[0].type is 'UPDATE'
        @emit 'hook', {repoId: 'airship'}
      res.send {success: true}

  deactivateRepo: (userModel, repoId, callback) -> callback()

module.exports = AirshipStashSource
```

One important thing to note is that a one-off source, especially in enterprise, will not set up any webhooks, and some (like the example above) may rely on you having set up an SSH key. You will have to set up the webhook and authorize a key yourself. Once you've done so, you can configure your source to clone using your key by adding an `SSH_KEYPATH` variable to `config/SOURCE_NAME.coffee`:

```coffeescript
module.exports =
  SSH_KEYPATH: '~/.ssh/sentry_rsa'
```

