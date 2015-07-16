module.exports = (dependencies) ->
  {packages: {mongoose, 'mongoose-findorcreate': findOrCreate, lodash: _}} = dependencies
  Mixed = mongoose.Schema.Types.Mixed
  ActiveRepoSchema = new mongoose.Schema {
    repoId: {type: String, required: true},
    userId: {type: String, required: true},
    sourceProviderName: {type: String, required: true},
    configObject: {type: Mixed}
    activeServices: {type: [String]}
  }
  ActiveRepoSchema.path('activeServices').default -> [] # New empty array for every active repo's services
  ActiveRepoSchema.path('configObject').default -> {includeFiles: ['**/*'], excludeFiles: []} # New empty config object for every repo
  ActiveRepoSchema.plugin findOrCreate

  ActiveRepo = mongoose.model 'ActiveRepo', ActiveRepoSchema
  return {
    model: ActiveRepo,
    schema: ActiveRepoSchema
  }
