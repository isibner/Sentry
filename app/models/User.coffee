module.exports = (dependencies) ->
  {packages: {mongoose, bcryptjs, 'mongoose-findorcreate': findOrCreate, lodash: _}} = dependencies
  UserSchema = new mongoose.Schema {username: {type: String, required: true}, hashedPassword: {type: String, required: true}, pluginData: {}}
  UserSchema.plugin findOrCreate
  User = mongoose.model 'User', UserSchema
  _.extend User::, {verifyPassword: (password) -> return bcryptjs.compareSync password, @hashedPassword}

  return {
    model: User,
    schema: UserSchema
  }
