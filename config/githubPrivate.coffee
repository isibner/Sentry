module.exports = (dependencies) ->
  {packages: {path}} = dependencies
  root = path.join __dirname, '..'
  return {
    CLIENT_ID: process.env.GITHUB_PRIVATE_CLIENT_ID || 'undefined-client-id'
    CLIENT_SECRET: process.env.GITHUB_PRIVATE_CLIENT_SECRET || 'undefined-client-secret'
    BOT_USERNAME: process.env.BOT_USERNAME
    BOT_PASSWORD: process.env.BOT_PASSWORD
    USER_AGENT: process.env.GITHUB_PRIVATE_USER_AGENT || 'undefined-user-agent'
  }
