module.exports = (dependencies) ->
  {packages: {mongoose, 'mongoose-findorcreate': findOrCreate, lodash: _}} = dependencies
  {Mixed, ObjectId} = mongoose.Schema.Types
  ActiveRepoSchema = new mongoose.Schema {
    repoId: {type: String, required: true},
    userId: {type: ObjectId, required: true},
    sourceProviderName: {type: String, required: true},
    configObject: {type: Mixed}
    activeServices: {type: [String]}
  }
  ActiveRepoSchema.path('activeServices').default -> [] # New empty array for every active repo's services
  ActiveRepoSchema.path('configObject').default -> {includeFiles: ['**/*'], excludeFiles: []} # New empty config object for every repo
  ActiveRepoSchema.plugin findOrCreate

  ActiveRepoSchema.methods.getPath = () -> return this._id.toString()

  ActiveRepo = mongoose.model 'ActiveRepo', ActiveRepoSchema
  return {
    model: ActiveRepo,
    schema: ActiveRepoSchema
  }
