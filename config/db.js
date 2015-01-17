var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

mongoose.connect(config.mongo.uri);
var db = mongoose.connection;

db.on('connected', function () {
  console.log('Mongoose connected');
});

db.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

db.on('error', function (err) {
  console.log('Mongoose error: ' + err);
});

var models = [
  'user'
];

models.forEach(function (model) {
  require(path.join(config.appRoot, 'models', model));
});

module.exports = db;
