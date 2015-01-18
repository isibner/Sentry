var github = require('../../config/github');
var config = require('../../config/config');

var todoRegex = /^\+[\s]+[\W]*[\s]*TODO[\W|\s]*/i; // regex match for finding a TODO comment
var labelRegex = /^\+[\s]+[\W]*[\s]*LABELS[\W|\s]*/i; // regex match for finding a LABELS comment
var bodyRegex = /^\+[\s]+[\W]*[\s]*BODY[\W|\s]*/i; // regex match for finding a BODY comment

var apiDone = function (res, next) {
  return function (err) {
    if (err) {
      return next(err);
    }
    res.send({success: true});
  };
};

exports.addRepo = function (req, res, next) {
  var done = apiDone(res, next);
  var user = req.user;
  var authCreds = {
    type: 'oauth',
    token: user.accessToken
  };
  var collaboratorData = {
    user: user.profile.login,
    repo: req.params.repo,
    collabuser: config.BOT_USERNAME
  };
  console.log('data', collaboratorData);
  github(authCreds).repos.addCollaborator(collaboratorData, function (err) {
    if (err) {
      return next(err);
    }
    user.repos = user.repos || [];
    user.repos.push(req.params.repo);
    user.save(done);
  });
};

var isTodo = function(str) {
  return todoRegex.test(str);
}

var getTodoTitle = function(str) {
  return str.split(todoRegex)[1];
}

var isTodoLabel = function(str) {
  return labelRegex.test(str);
}

var isTodoBody = function(str) {
  return bodyRegex.test(str);
}

var getTodoData = function(additions, idx) {
  if (idx >= additions.length) { return null; }

  var str = additions[idx];

  if (isTodoLabel(str)) {
    return ['labels', str.split(labelRegex)[1]];
  } else if (isTodoBody(str)) {
    return ['body', str.split(bodyRegex)[1]];
  } else {
    return null;
  }
}

var getTodos = function(additions) {
  var todos = []

  for (var i = 0; i < additions.length; i++) {
    var addition = additions[i];
    if (isTodo(addition)) {
      var todo = {
        title: getTodoTitle(addition),
      };

      var idx = i+1;
      var data = getTodoData(additions, idx);
      while (data != null) {
        todo[data[0]] = data[1];
        idx++;
        var data = getTodoData(additions, idx);
      }

      todos.push(todo);
    }
  }
}

var webhookPushHandler = function(data) {
  var authCreds = {
    type: 'basic',
    username: config.BOT_USERNAME,
    password: config.BOT_PASSWORD,
  };

  var repoOwner = data.repository.owner.name;
  var repoName = data.repository.name;
  var commitSha = data.after;

  var msg = {
    user: repoOwner,
    repo: repoName,
    sha: commitSha,
  }

  var additions = [];
  var subtractions = [];

  var commit = github(authCreds).repos.getCommit(msg, function(err, res) {
    var author = res.author.login;
    var files = res.files;

    // go thru each files, find the patches, and separate the additions from subtractions in file
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var patch = file.patch.split('\n');

      for (var j = 0; j < patch.length; j++) {
        var line = patch[j];

        if (line.lastIndexOf('+', 0) === 0) {
          additions.push(line);
        } else if (line.lastIndexOf('-', 0) === 0) {
          subtractions.push(line);
        }
      }
    }

    console.log(additions);
    console.log(subtractions);

    newTodos = getTodos(additions);
    console.log(newTodos);

  });
}

exports.webhookAll = function (req, res, next) {
  console.log('Webhook!');
  // console.log(req);
  webhookPushHandler(req.body);
  apiDone(res, next)();
}
