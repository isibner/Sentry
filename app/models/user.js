var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  profile: {
    type: {},
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  }
});

UserSchema.plugin(findOrCreate);

mongoose.model('User', UserSchema);
