var GithubAPI = require('github');

module.exports = function githubAuthenticate (params) {
  var github = new GithubAPI({
    version: '3.0.0',
    debug: true,
    protocol: 'https',
    host: 'api.github.com',
    timeout: 5000,
    headers: {
      'user-agent': 'TodoBot'
    }
  });

  github.authenticate(params);
  return github;
};
