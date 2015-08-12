---
title: Configuring
template: markdown.html
---

# Configuring the server

The Sentry server is designed to be easily configurable. The config file at `config/server.coffee` is used to define server variables, such as your database URI, while the file at `config/plugins.coffee` is used to register new sources and services.

`config/plugins.coffee` is simple: the plugin packages are simply listed as strings and exported.

```coffeescript
sources = ['sentry-source-github']
services = ['sentry-service-cruft']

module.exports = {sources, services}
```

`config/server.coffee` is more complex, but the defaults are almost always what you want anyway.

```coffeescript
[path, url] = ['path', 'url'].map require
root = path.join __dirname, '..'
base = process.env.BASE_URL || 'http://localhost:3000/'

module.exports =
  ROOT: root
  APP_ROOT: path.join(root, 'app')
  CLONE_ROOT: path.join(root, '.cloned_repos')
  COOKIE_SECRET: process.env.COOKIE_SECRET || '12345'
  BASE_URL: base
  DASHBOARD_URL: url.resolve(base, '/dashboard')
  MONGO_URI: process.env.MONGOLAB_URI || 'mongodb://localhost/todo-app'
```

Note that since they're just CoffeeScript, you can reference NPM modules and environment variables from within these config files. This is very useful for interfacing with services like Heroku, where variables like `MONGO_URI` might be set on `process.env` and subject to change.

# Configuring individual plugins

Both types of plugins - sources and services - can be configured by editing their config files, which should be located at `config/PLUGIN_NAME.coffee`. A plugin's supported config variables should be listed in its README. As an example, here is `cruft.coffee`, which is the config file for [sentry-service-cruft](http://github.com/isibner/sentry-service-cruft).

```coffeescript
module.exports = {
  cruftTypes: [
    {
      name: 'Todo Comments'
      regex: /^[\+|\-]?[\s]*[\W]*[\s]*TODO[\W|\s]+(?=\w+)/i
    },
    {
      name: 'Ignored Tests'
      regex: /^[\s]*@Ignore(\s+|$)/i
    }
  ]
}
```

As with the server config, you can reference NPM modules and environment variables from within these config files.

# Configuring repositories

You can also configure each active repository from within the app. Here, you can limit the files that each service will process, and override service configurations with repo-specific settings. An example configuration is shown below. Only files in `src` will be processed by services, and the Cruft Tracker service will further ignore anything in `bower_components`. The `cruftTypes` property from the cruft tracker's configuration has also been overridden.

```json
{
    "includeFiles": "src/**/*",
    "cruft": {
        "excludeFiles": "**/bower_components/**/*",
        "cruftTypes": [
            {
                "name": "HACKHACK comments",
                "regex": "^[\\+|\\-]?[\\s]*[\\W]*[\\s]*HACKHACK"
            }
        ]
    }
}
```
