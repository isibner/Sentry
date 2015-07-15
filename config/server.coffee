module.exports = (dependencies) ->
  {packages: {path}} = dependencies
  root = path.join __dirname, '..'
  return {
    ROOT: root
    APP_ROOT: path.join(root, 'app')
    COOKIE_SECRET: process.env.COOKIE_SECRET || '12345'
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000/'
    MONGO_URI: process.env.MONGOLAB_URI || 'mongodb://localhost/todo-app'
  }
