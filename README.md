# Sentry

## Continuous Integration for Code Quality

Sentry constantly watches your codebase to provide a birds-eye view of your source code, tracking all kinds of code cruft in plain JSON (or prettier HTML). It is fully pluggable - you can write your own metrics as **services** and pull from any Git source with **source providers**.

### Motivation

The initial inspiration from Sentry came from lessons learned while building [TodoBot](https://github.com/FabioFleitas/todobot). The idea of tracking source-code quality was a good one, but there were two problems with the approach we took:

1. It was difficult to extend TodoBot to track other source-code-level issues, such as ignored tests.
2. TodoBot was tied to GitHub, and could not easily be modified to support other Git hosts, such as BitBucket, GitLab, or Stash.

Sentry solves these problems by providing a plugin API. **Source provider plugins** are used to represent remote Git sources: GitHub is supported (in public and private flavors), and BitBucket/GitLab support are coming soon. **Service plugins** represent ways to process code received from a source provider, and can be reused across many different Git sources. The Sentry app acts as an intermediate layer between source providers and services, listening to the source providers and running the active services for each repo when the data changes.

![Sentry architecture.](https://docs.google.com/drawings/d/1T4fILw5CzybzsWGTqvf85UDYSr69ShZOT4TGyaQYMnQ/pub?w=720&h=540)

### Quick Start

This will set up a Sentry instance with the [GitHub source provider](https://github.com/isibner/sentry-source-github) and the [cruft tracker service.](https://github.com/isibner/sentry-service-cruft).

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

You may also want to add a configuration file, which should go under `config/PLUGIN_NAME.coffee`.

### Configuring Plugins

Both source providers and services can be configured by editing their config files, which should be put at `config/PLUGIN_NAME.coffee`. The variables you can configure will vary depending on the plugin - check the plugin's own README for a list of what it supports.

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

To help get you started with writing your own plugins for Sentry, there are two heavily-annotated templates in this repository: [one for source providers](SourceProviderTemplate.coffee), and [one for services](ServiceTemplate.coffee). We want writing plugins to be *really easy*, so if something is unclear, it's our fault - not yours! Post an issue on this repository and we'll be happy to help you out.

### List of Plugins

###### Source Providers

* [sentry-source-github](https://github.com/isibner/sentry-source-github) - plugin for GitHub public repos
* [sentry-source-github-private](https://github.com/isibner/sentry-source-github-private) - plugin for GitHub private repos

###### Services

* [sentry-service-cruft](https://github.com/isibner/sentry-service-cruft) - track common cruft patterns in your code, like `// TODO` comments and ignored tests.
