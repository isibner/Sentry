module.exports = (dependencies) ->
  {packages: {mongoose}, config: {server: {MONGO_URI}}} = dependencies
  mongoose.connect(MONGO_URI)
  db = mongoose.connection
  db.on 'connected', -> console.log 'Mongoose connected'
  db.on 'disconnected', -> console.log 'Mongoose disconnected'
  db.on 'error', (err) -> console.log('Mongoose error: ' + err)

  return db
