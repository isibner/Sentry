require('coffee-script/register');

var _   = require('lodash');
var app = require('express')();

var dependencies = require('./initializeDependencies');

_.forEach(dependencies.appInitializers, function (initializer, name) {
  initializer(app);
});

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening at http://%s:%s', server.address().address, server.address().port);
});
