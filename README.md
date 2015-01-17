# node-boiler

A basic Node.js web application which can be used as a starting point for building something bigger.

Includes the following components:
- Microframework: [express](http://expressjs.com/)
    - [express-handlebars](https://github.com/ericf/express-handlebars)
    - [express-validator](https://github.com/ctavan/express-validator)
    - [express-session](https://github.com/expressjs/session)
    - [body-parser](https://github.com/expressjs/body-parser)
    - [cookie-parser](https://github.com/expressjs/cookie-parser)
    - [morgan](https://github.com/expressjs/morgan)
- Database: [mongoose](http://mongoosejs.com/)
- Authentication: [passport](http://passportjs.org/)
    - [passport-local-mongoose](https://github.com/saintedlama/passport-local-mongoose)
- CSS boilerplate: [skeleton](http://www.getskeleton.com/)
- Dev tools:
  - [eslint](http://eslint.org/) config
  - [fig](http://www.fig.sh/) file
  - [gruntfile](http://gruntjs.com/)

Actual functionality is just a basic User model with a few views and controllers supporting registration and logging in/out.

## Purpose

`node-boiler` is ultimately meant to be three things:
  1. A quick starting point for new projects
  2. Documentation of my personal preferences and practices
  3. A good example of sensible organization and "best" practices (to point people toward)

This project generally represents how I would recommend starting a project (when suitable) and going about various things; it's a sort of go-to toolbox. I have some reasoning behind most of the choices and have explicitly chosen them over alternatives, and I try my best to organize things sensibly and follow best practices. Of course, there may easily be better practices or alternatives that I have not come across, so if you have any suggestions or better ways to do things, please let me know!

## Extras, intentionally excluded:
Continuing with the "go-to toolbox" idea, the following are libraries which I've used in the past and would happily use again when applicable, but which were beyond the scope of this starting point.

Testing:
- [nodeunit](https://github.com/caolan/nodeunit) - simple, minimal, unit
- [mocha](http://mochajs.org/) - flexible, unit
- [supertest](https://github.com/tj/supertest) - end-to-end api
- [casper](http://casperjs.org/) - end-to-end browser
- [istanbul](https://github.com/gotwarlost/istanbul) - code coverage
- [loadtest](https://github.com/alexfernandez/loadtest) - performance/load

Packages that fill common specific needs:
- [highland](http://highlandjs.org/) - streams for everything, everything for streams
- [async](https://github.com/caolan/async) - functional & control flow utils
- [request](https://github.com/request/request) - HTTP client
- [kue](https://github.com/learnboost/kue) - task queue (see also my [minimal example](https://github.com/LewisJEllis/node-kue-example))
- [winston](https://github.com/flatiron/winston) - multi-transport logging
- [nodemailer](http://nodemailer.com/) - send emails
- [sequelize](http://sequelizejs.com/) or [bookshelf](http://bookshelfjs.org/) - SQL ORMs
- [moment](http://momentjs.com/) - data manipulation
- [multer](https://github.com/expressjs/multer) - multipart uploads
- [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) - to find more stuff

Frontend: I don't do/know as much frontend stuff, but I like [backbone](http://backbonejs.org) for its minimal make-your-own-decisions philosophy and simple API.

## How to get running:

For Mac users, install Docker according to [these instructions](https://docs.docker.com/installation/) and make sure you can do:

    $ boot2docker init
    $ boot2docker start
    $ $(boot2docker shellinit)
    $ boot2docker ip

Install fig:

    $ pip install -U fig

Clone, install dependencies, and run:

    $ git clone https://github.com/LewisJEllis/node-boiler.git
    $ cd node-boiler
    $ npm install
    $ fig up

Running `boot2docker ip` probably gave you 192.168.59.103, so head to [http://192.168.59.103:3000](http://192.168.59.103:3000). If it gave you a different IP, use that one instead.

At this point, you can just `rm -rf .git` and be on your way to a new project.

To get a CLI to the mongo container, use:

    $ mongo $(boot2docker ip)/node-boiler
