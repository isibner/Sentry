var path = require('path');

var root = path.join(__dirname, '..');

module.exports = {
  root: root,
  appRoot: path.join(root, 'app'),
  cookieSecret: process.env.COOKIE_SECRET || '12345',
  mongo: {
    uri: process.env.MONGOLAB_URI || 'mongodb://localhost/todo-app'
  },
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'wat',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'wat',
  WEBHOOK_URL: 'https://todobot.herokuapp.com/api/webhook/all',
  CALLBACK_URL: 'https://todobot.herokuapp.com/auth/github/callback',

  BOT_USERNAME: process.env.BOT_USERNAME,
  BOT_PASSWORD: process.env.BOT_PASSWORD
};
