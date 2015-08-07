module.exports = (dependencies) ->
  {packages: {mongoose, bcryptjs, 'mongoose-findorcreate': findOrCreate, lodash: _}} = dependencies
  Mixed = mongoose.Schema.Types.Mixed
  UserSchema = new mongoose.Schema {
    username: {type: String, required: true},
    hashedPassword: {type: String, required: true},
    pluginData: {type: Mixed}
  }
  UserSchema.path('pluginData').default -> {} # New empty object for every user's plugin data
  UserSchema.plugin findOrCreate
  User = mongoose.model 'User', UserSchema
  # coffeelint: disable=missing_fat_arrows
  _.extend User::, {verifyPassword: (password) -> return bcryptjs.compareSync password, @hashedPassword}
  # coffeelint: enable=missing_fat_arrows
  return {
    model: User,
    schema: UserSchema
  }
