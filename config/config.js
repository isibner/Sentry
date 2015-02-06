var path = require('path');

var root = path.join(__dirname, '..');

module.exports = {
  root: root,
  appRoot: path.join(root, 'app'),
  cookieSecret: '12345',
  mongo: {
    uri: process.env.MONGOLAB_URI || 'mongodb://localhost/todo-app'
  },
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'wat',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'wat',

  BOT_USERNAME: process.env.BOT_USERNAME,
  BOT_PASSWORD: process.env.BOT_PASSWORD
};
