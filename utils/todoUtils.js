var _ = require('lodash');

var defaultRegexes = {
  todoRegex: /^[\+|\-]?[\s]*[\W]*[\s]*TODO[\W|\s]*(?=\w+)/i,
  labelRegex: /^\+?[\s]*[\W]*[\s]*LABELS[\W|\s]*(?=\w+)/i,
  bodyRegex: /^\+?[\s]*[\W]*[\s]*BODY[\W|\s]*(?=\w+)/i,
  extensions: []
};

var fileRegexes = [
  {
    todoRegex: /^[\+|\-]?[\s]*[\/\/|\*]*[\s]*TODO[\W|\s]*(?=\w+)/i,
    labelRegex: /^\+?[\s]*[\/\/|\*]*[\s]*LABELS[\W|\s]*(?=\w+)/i,
    bodyRegex: /^\+?[\s]*[\/\/|\*]*[\s]*(?=\w+)/i,
    extensions: [ '.c', '.cpp', '.java', '.js', '.less', '.m', '.sass', '.scala', '.scss', '.swift']
  },
  {
    todoRegex: /^[\+|\-]?[\s]*[#]*[\s]*TODO[\W|\s]*(?=\w+)/i,
    labelRegex: /^\+?[\s]*[#]*[\s]*LABELS[\W|\s]*(?=\w+)/i,
    bodyRegex: /^\+?[\s]*[#]*[\W|\s]*(?=\w+)/i,
    extensions: ['.bash', '.coffee', '.pl', '.py', '.rb', '.sh', '.zsh']
  }
];

var getExtension = module.exports.getExtension = function (filename) {
  return filename.lastIndexOf('.') >= 0 ? filename.substring(filename.lastIndexOf('.')) : null;
};

var regexesForFilename = function (filename) {
  var extension = getExtension(filename);
  for (var i = 0; i < fileRegexes.length; i++) {
    if (fileRegexes[i].extensions.indexOf(extension) >= 0 ) {
      return fileRegexes[i];
    }
  }
  return defaultRegexes;
};

var isTodo = module.exports.isTodo = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return regexes.todoRegex.test(line);
};

var getTodoTitle = module.exports.getTodoTitle = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return line.split(regexes.todoRegex)[1];
};

var isTodoLabel = module.exports.isTodoLabel = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return regexes.labelRegex.test(line);
};

var getTodoLabels = module.exports.getTodoLabels = function (line, filename) {
  var regexes = regexesForFilename(filename);
  var trim = function (str) {
    return str.trim();
  };
  var rawLabels = line.split(regexes.labelRegex)[1].split(',');
  return _(rawLabels).map(trim).uniq().value();
};

var isTodoBody = module.exports.isTodoBody = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return regexes.bodyRegex.test(line);
};

var getTodoBody = module.exports.getTodoBody = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return line.split(regexes.bodyRegex)[1];
};

// files -- [{path: String, lines: [String]}]
// repo  -- String
// returns -- [{title: String, labels: [String], lineNum: String, path: String, repo: String, body: String | null}]
module.exports.parseTodos = function (files, repo) {
  var result = [];
  files.forEach(function (file) {
    var currentTodo = null;
    for (var lineNum = 0; lineNum < file.lines.length; lineNum++) {
      var line = file.lines[lineNum];
      if (isTodo(line, file.path)) {
        currentTodo = {
          title: getTodoTitle(line, file.path),
          lineNum: lineNum + 1,
          path: file.path,
          repo: repo,
          labels: []
        };
        result.push(currentTodo);
      } else if (currentTodo && isTodoLabel(line, file.path)) {
        currentTodo.labels = getTodoLabels(line, file.path);
      } else if (currentTodo && isTodoBody(line, file.path)) {
        currentTodo.body = currentTodo.body || [];
        currentTodo.body.push(getTodoBody(line, file.path));
      } else {
        currentTodo = null;
      }
    }
  });
  return result.map(function (todo) {
    // Combine all the body lines into a single string
    var trim = function (str) {
      return str.trim();
    };
    todo.body = todo.body ? todo.body.map(trim).join(' ') : null;
    return todo;
  });
};
