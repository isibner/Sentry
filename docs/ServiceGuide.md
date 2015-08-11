## Writing Sentry Services

A Sentry service represents a way of keeping track of metadata about a Git repository. It receives all the files from a repo
when it is activated and whenever the repository changes. After that, you can do anything you like with those files - count them,
parse them, scan them for style violations, whatever. You can also expose REST endpoints so that the data your service collects
is available to other applications.

At its core, a Sentry service is just an NPM module that exposes a service class. So all the normal rules of Node apply -
you can have other modules as dependencies, make helper files, and so on. At a minimum though, a bare-bones sentry service needs
three things: a `package.json` file, a source class (which will be the module's export), and an icon file.

```
sentry-service-awesome
├── icon.png
├── index.js
└── package.json
```

### `package.json`

This is just a regular old package.json file, for the most part; see [the npm docs](https://docs.npmjs.com/files/package.json)
if you're unfamiliar. There are only a few best practices to note here:

* Your package name should follow the format `sentry-service-YOUR-SOURCE-NAME`. This makes it easy for others to see your source
name at a glance. Note that your source name should be in kebab-case.
* Sentry already provides many of the dependencies you're likely to use, so you can put them in `peerDependencies`. In particular,
if you want to use [handlebars](https://github.com/wycats/handlebars.js) or [passport](https://github.com/jaredhanson/passport),
these should go in `peerDependencies` so you get the same instance as Sentry.
* If you're publishing to NPM, the keywords for your package should include `"sentry"`, `"service"`, and your service's name.

### `icon.png`

A square icon that Sentry will use to display your service in the UI. 128x128 is a good size.
### `index.js`

This is what your NPM module exposes - a class representing your Sentry service.

It is **highly recommended**, though not required, that you implement this class in CoffeeScript, then compile it into a `.js`
file. An annotated template, which specifies all required methods and their parameters, can be found in 
[`ExampleService.coffee`](./ExampleService.coffee). The best way to write a simple source is to copy this 
template into your own project and fill in the method stubs. You can also check [the list of existing services](https://github.com/isibner/Sentry/#services)
for working examples.
