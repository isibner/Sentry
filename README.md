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
