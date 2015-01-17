var path = require('path');

var root = path.join(__dirname, '..');

module.exports = {
  root: root,
  appRoot: path.join(root, 'app'),
  cookieSecret: '12345',
  mongo: {
    uri: process.env.MONGOLAB_URI || 'mongodb://localhost/node-boiler'
  }
};
