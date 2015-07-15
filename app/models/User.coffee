module.exports = (dependencies) ->
  {packages: {mongoose, 'mongoose-findorcreate': findOrCreate}} = dependencies
  UserSchema = new mongoose.Schema {pluginData: {}}
  UserSchema.plugin findOrCreate
  User = mongoose.model 'User', UserSchema
  return {
    model: User,
    schema: UserSchema
  }
