module.exports = (dependencies) ->
  {packages: {path}} = dependencies
  root = path.join __dirname, '..'
  return
    ROOT: root
    APP_ROOT: path.join(root, 'app')
    COOKIE_SECRET: process.env.COOKIE_SECRET || '12345'
    WEBHOOK_URL: 'https://todobot.herokuapp.com/api/webhook/all'
    CALLBACK_URL: 'https://todobot.herokuapp.com/auth/github/callback'
    MONGO_URI: process.env.MONGOLAB_URI || 'mongodb://localhost/todo-app'
