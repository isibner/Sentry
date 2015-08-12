---
title: Plugins
template: markdown.html
---
# Adding Plugins

Sentry plugins are packaged as NPM modules. To install one, use `npm install $PLUGIN_PACKAGE_NAME`, and add the package name to [`config/plugins.coffee`](config/plugins.coffee).

You will also want to add a configuration file, which should go under `config/PLUGIN_NAME.coffee`. The plugin package's README should have a full list of its supported configuration variables.

# List of plugins

### Sources

* [sentry-source-github](https://github.com/isibner/sentry-source-github) - plugin for GitHub public repos
* [sentry-source-github-private](https://github.com/isibner/sentry-source-github-private) - plugin for GitHub private repos

### Services

* [sentry-service-cruft](https://github.com/isibner/sentry-service-cruft) - track common cruft patterns in your code, like `// TODO` comments and ignored tests.