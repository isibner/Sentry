---
title: Plugins
template: markdown.html
---
# Adding Plugins

Sentry plugins are packaged as NPM modules, so you can install them like you would any other module.
```
npm install --save $PLUGIN_PACKAGE_NAME
```

Don't forget to add the package name to `config/plugins.coffee` so that Sentry knows to use it!

You will also want to add a configuration file, which should go under `config/PLUGIN_NAME.coffee`. The plugin package's README should have a full list of its supported configuration variables. See the [docs on plugin configuration](../configuring/#configuring-individual-plugins) for details.

# List of plugins

### Sources

* [sentry-source-github](https://github.com/isibner/sentry-source-github) - plugin for GitHub public repos
* [sentry-source-github-private](https://github.com/isibner/sentry-source-github-private) - plugin for GitHub private repos

### Services

* [sentry-service-cruft](https://github.com/isibner/sentry-service-cruft) - track common cruft patterns in your code, like `// TODO` comments and ignored tests.