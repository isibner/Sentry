module.exports = (dependencies) ->
  {packages: {mongoose, 'mongoose-findorcreate': findOrCreate, lodash: _}} = dependencies
  {Mixed, ObjectId} = mongoose.Schema.Types
  ActiveRepoSchema = new mongoose.Schema {
    repoId: {type: String, required: true},
    userId: {type: ObjectId, required: true},
    sourceProviderName: {type: String, required: true},
    configObject: {type: Mixed},
    activeServices: {type: [String]}
  }
  ActiveRepoSchema.path('activeServices').default -> [] # New empty array for every active repo's services
  ActiveRepoSchema.path('configObject').default -> {includeFiles: ['**/*'], excludeFiles: []} # New default config object for every repo
  ActiveRepoSchema.plugin findOrCreate

  # coffeelint: disable=missing_fat_arrows
  ActiveRepoSchema.methods.getPath = () -> return this._id.toString()
  # coffeelint: enable=missing_fat_arrows

  ActiveRepo = mongoose.model 'ActiveRepo', ActiveRepoSchema
  return {
    model: ActiveRepo,
    schema: ActiveRepoSchema
  }
