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

var trim = function (str) {
  return str.trim();
};

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

var Todo = module.exports.Todo = function (options) {
  this.lines = options.lines || [];
  this.repo = options.repo;
  this.path = options.path;
  this.lineNum = options.lineNum;
};

Todo.prototype.title = function () {
  return _(this.lines)
    .filter((_.partial(isTodo, _, this.path)))
    .map(_.partial(getTodoTitle, _, this.path))
    .map(trim)
    .value()
    .join(' ');
};

Todo.prototype.labels = function () {
  return _(this.lines)
    .filter(_.partial(isTodoLabel, _, this.path))
    .map(_.partial(getTodoLabels, _, this.path))
    .flatten()
    .value();
};

Todo.prototype.body = function () {
  return _(this.lines)
    .filter(_.partial(isTodoBody, _, this.path))
    .filter(_.negate(_.partial(isTodoLabel, _, this.path)))
    .filter(_.negate(_.partial(isTodo, _, this.path)))
    .map(_.partial(getTodoBody, _, this.path))
    .map(trim)
    .value()
    .join(' ');
};

// files   -- [{path: String, lines: [String]}]
// repo    -- String
// returns -- [{title: -> String, labels: -> [String], body: -> String | null, lineNum: Number, path: String, repo: String, lines: [String]}]
module.exports.parseTodos = function (files, repo) {
  var result = [];
  files.forEach(function (file) {
    var parsingTodo = false;
    for (var lineNum = 0; lineNum < file.lines.length; lineNum++) {
      var line = file.lines[lineNum];
      if (isTodo(line, file.path)) {
        parsingTodo = true;
        var todo = new Todo({
          lineNum: lineNum + 1,
          path: file.path,
          repo: repo,
          lines: [line]
        });
        result.push(todo);
      } else if (parsingTodo && (isTodoLabel(line, file.path) || isTodoBody(line, file.path))) {
        result[result.length - 1].lines.push(line);
      } else {
        parsingTodo = false;
      }
    }
  });
  return result;
};
