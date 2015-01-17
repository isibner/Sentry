var mongoose = require('mongoose');
var github = require('../../config/github');
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
  }
});

UserSchema.plugin(findOrCreate);

UserSchema.methods.findOwnRepos = function findOwnRepos(callback) {
  var authCreds = {
    type: 'oauth',
    token: this.accessToken
  };
  github(authCreds).repos.getAll({
    type: 'owner',
    sort: 'updated',
    direction: 'desc'
  }, callback);
};

mongoose.model('User', UserSchema);
