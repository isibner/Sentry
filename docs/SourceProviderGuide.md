## Writing Sentry Source Providers

By writing a source provider, you integrate your favorite Git source with Sentry. This allows you to track your code even
when it's on a privately-hosted Git services like Stash. If your service of choice supports OAuth, your source
can use that to authenticate.

At its core, a Sentry source is just an NPM module that exposes a source provider class. So all the normal rules of Node apply -
you can have other modules as dependencies, make helper files, and so on. At a minimum though, a bare-bones sentry source needs
three things: a `package.json` file, a source class (which will be the module's export), and an icon file.

```
sentry-source-awesome
├── icon.png
├── index.js
└── package.json
```

### package.json

This is just a regular old package.json file, for the most part; see [the npm docs](https://docs.npmjs.com/files/package.json)
if you're unfamiliar. There are only a few best practices to note here:

* Your package name should follow the format `sentry-source-YOUR-SOURCE-NAME`. This makes it easy for others to see your source
name at a glance. Note that your source name should be in kebab-case.
* Sentry already provides many of the dependencies you're likely to use, so you can put them in `peerDependencies`. In particular,
if you want to use [handlebars](https://github.com/wycats/handlebars.js) or [passport](https://github.com/jaredhanson/passport),
these should go in `peerDependencies` so you get the same instance as Sentry.
* If you're publishing to NPM, the keywords for your package should include `"sentry"`, `"source"`, and your source's name.

