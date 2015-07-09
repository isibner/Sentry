var assert    = require('chai').assert;
var fs        = require('fs');
var path      = require('path');
var todoUtils = require('../utils/todoUtils');
var diffUtils = require('../utils/diffUtils');

var fixturesDir = path.join(__dirname, 'fixtures');

var todosEqual = function (newTodos, oldTodos) {
  return false && newTodos === oldTodos;
};

describe('DiffUtils', function () {
  it('should work when only description is edited', function () {
    var dirPath  = path.join(fixturesDir, 'only-description');
    var oldPath  = path.join(dirPath, 'old.less');
    var diffPath = path.join(dirPath, 'diff.txt');
    var newPath  = path.join(dirPath, 'new.less');

    var oldFile = {path: oldPath, lines: fs.readFileSync(oldPath, 'utf8').split('\n')};
    var newFile = {path: newPath, lines: fs.readFileSync(newPath, 'utf8').split('\n')};
    var diff    = fs.readFileSync(diffPath, 'utf8').split('\n');

    var repo = 'repo';
    var oldTodos = todoUtils.parseTodos([oldFile], repo);
    var newTodos = todoUtils.parseTodos([newFile], repo);
    assert.ok(todosEqual(diffUtils.updatedTodos(oldTodos, diff), newTodos));
  });

  it('should work when only title is edited and Levenshtein distance is small', function () {

  });

  it('should work when only title is edited and Levenshtein distance is large', function () {

  });

  it('should work when only labels are edited', function () {

  });

  it('should work when only labels are edited', function () {

  });

  it('should work when title, label, and description are all edited', function () {

  });

  it('should work when no edits have been made and one todo has been added', function () {

  });

  it('should work when an edit has been made and a todo has been added', function () {

  });

  it('should work when an edit has been made and a todo is deleted', function () {

  });

  it('should work on a mixture of edits, additions, and deletions', function () {

  });

  it('should ignore "no newline at end of file" annotations', function () {

  });
});
