# Sentry

## Continuous Integration for Code Quality

Sentry constantly watches your codebase to provide a birds-eye view of your source code, tracking all kinds of code cruft in plain JSON (or prettier HTML). It is fully pluggable - you can write your own metrics as **services** and pull from any Git source with **sources**.

### Documentation

All documentation for Sentry is on the GitHub pages site (http://isibner.github.io/sentry/). The quick-start is duplicated below for convenience.

### Quick Start

This will set up a Sentry instance with the [GitHub source](https://github.com/isibner/sentry-source-github) and the [cruft tracker service.](https://github.com/isibner/sentry-service-cruft).

First, you will need [MongoDB](http://docs.mongodb.org/manual/installation/) running in the background. In a new terminal, TMUX, or as a background process, do:

```bash
mongod
```

Then, clone Sentry and install its dependencies:

```bash
git clone https://github.com/isibner/Sentry.git
cd Sentry
npm install
npm install sentry-source-github sentry-service-cruft
```

You will need to configure these two plugins - see the [sentry-source-github](https://github.com/isibner/sentry-source-github) and [sentry-service-cruft](https://github.com/isibner/sentry-service-cruft) docs for instructions on configuration. Once they are configured, you can run your Sentry server with:

```bash
npm start
```

You should now have a sentry server running at [http://localhost:3000](http://localhost:3000). You should be able to log in, authorize GitHub, and activate the Cruft Tracker service on any of your public repositories. 

### Adding Plugins

Sentry plugins are packaged as NPM modules. To install one, use `npm install $PLUGIN_PACKAGE_NAME`, and add the package name to [`config/plugins.coffee`](config/plugins.coffee).

You will also want to add a configuration file, which should go under `config/PLUGIN_NAME.coffee`.

### Configuring Plugins

Both sources and services can be configured by editing their config files, which should be put at `config/PLUGIN_NAME.coffee`. The variables you can configure will vary depending on the plugin - check the plugin's own README for a list of what it supports.

You can also configure each active repository from with the app. Here, you can limit the files that each service will process, and specify repo-specific settings for services. An example configuration is shown below. Only files in `src` will be processed by services, and the Cruft Tracker service will further ignore anything in `bower_components`. The `cruftTypes` property from the cruft tracker's configuration has also been overridden.

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

### Writing Plugins

To help get you started with writing your own plugins for Sentry, we've provided two guides: [one for sources](docs/SourceGuide.md), and [one for services](ServiceGuide.md). We want writing plugins to be *really easy*, so if something is unclear, it's our fault - not yours! Post an issue on this repository and we'll be happy to help you out.

### List of Plugins

###### Sources

* [sentry-source-github](https://github.com/isibner/sentry-source-github) - plugin for GitHub public repos
* [sentry-source-github-private](https://github.com/isibner/sentry-source-github-private) - plugin for GitHub private repos

###### Services

* [sentry-service-cruft](https://github.com/isibner/sentry-service-cruft) - track common cruft patterns in your code, like `// TODO` comments and ignored tests.
