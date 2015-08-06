[path, url] = ['path', 'url'].map require
root = path.join __dirname, '..'
base = process.env.BASE_URL || 'http://localhost:3000/'

module.exports =
  ROOT: root
  APP_ROOT: path.join(root, 'app')
  CLONE_ROOT: path.join(root, '.cloned_repos')
  COOKIE_SECRET: process.env.COOKIE_SECRET || '12345'
  BASE_URL: base
  DASHBOARD_URL: url.resolve(base, '/dashboard')
  MONGO_URI: process.env.MONGOLAB_URI || 'mongodb://localhost/todo-app'
