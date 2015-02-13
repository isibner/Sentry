var fs = require('fs');
var istextorbinary = require('istextorbinary');

module.exports.isFile = function (filePath) {
  return fs.lstatSync(filePath).isFile();
};

module.exports.isTextFile = function (filePath) {
  return istextorbinary.isTextSync(filePath, fs.readFileSync(filePath));
};
