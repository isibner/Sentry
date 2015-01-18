var GithubAPI = require('github');

var github = new GithubAPI({
  version: '3.0.0',

  debug: true,
  protocol: 'https',
  //host: '', // not sure about this one
  parthPrefix: '/api/v3', // for some GHEs
  timeout: 5000,
  headers: {
    'user-agent': 'Github-Todo-App',
  }
});

var githubClientId = 'not the id';
var githubClientSecret = 'not the secret';

var token = '';

github.authorization.create({
  scopes: ["user", "public_repo", "repo", "repo:status", "gist"],
  note: "what this auth is for",
  note_url: "http://url-to-this-auth-app",
  client_id: githubClientId,
  client_secret: githubClientSecret,
}, function(err, res) {
  console.log(err);
  console.log(res);
  console.log('wow i am here');
  if (res) {
    //save and use res.token as in the Oauth process above from now on
    token = res.token;
    console.log(token);
  }
});

