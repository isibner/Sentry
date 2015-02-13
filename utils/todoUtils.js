var defaultRegexes = {
  todoRegex: /^[\+|\-]?[\s]*[\W]*[\s]*TODO:[\W|\s]*/i,
  labelRegex: /^\+?[\s]*[\W]*[\s]*TODO-LABELS:[\W|\s]*/i,
  bodyRegex: /^\+?[\s]*[\W]*[\s]*TODO-BODY:[\W|\s]*/i,
  extensions: []
};

var fileRegexes = [
  {
    todoRegex: /^[\+|\-]?[\s]*[\/\/]*[\s]*TODO:[\W|\s]*/i,
    labelRegex: /^\+?[\s]*[\/\/]*[\s]*TODO-LABELS:[\W|\s]*/i,
    bodyRegex: /^\+?[\s]*[\/\/]*[\s]*TODO-BODY:[\W|\s]*/i,
    extensions: ['.js', '.c', '.cpp', '.java']
  },
  {
    todoRegex: /^[\+|\-]?[\s]*[#]*[\s]*TODO:[\W|\s]*/i,
    labelRegex: /^\+?[\s]*[#]*[\s]*TODO-LABELS:[\W|\s]*/i,
    bodyRegex: /^\+?[\s]*[#]*[\s]*TODO-BODY:[\W|\s]*/i,
    extensions: ['.py', '.bash', '.sh']
  }
];

var getExtension = function (filename) {
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

module.exports.isTodo = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return regexes.todoRegex.test(line);
};

module.exports.getTodoTitle = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return line.split(regexes.todoRegex)[1];
};

module.exports.isTodoLabel = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return regexes.labelRegex.test(line);
};

module.exports.getTodoLabels = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return line.split(regexes.labelRegex)[1].split(', ');
};

module.exports.isTodoBody = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return regexes.bodyRegex.test(line);
};

module.exports.getTodoBody = function (line, filename) {
  var regexes = regexesForFilename(filename);
  return line.split(regexes.bodyRegex)[1];};
