var GithubAPI = require('github');

module.exports = function githubAuthenticate (params) {
  var github = new GithubAPI({
    version: '3.0.0',

    debug: true,
    protocol: 'https',
    //host: '', // not sure about this one
    parthPrefix: '/api/v3', // for some GHEs
    timeout: 5000,
    headers: {
      'user-agent': 'AutoToDo',
    }
  });

  github.authenticate(params);
  return github;
};
