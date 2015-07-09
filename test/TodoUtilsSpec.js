var assert    = require('chai').assert;
var fs        = require('fs');
var path      = require('path');
var todoUtils = require('../utils/todoUtils');
var Todo      = todoUtils.Todo;

var fixturesDir = path.join(__dirname, 'fixtures');

var DOUBLE_SLASH_TODO_LINE  = '// TODO - finish these tests!';
var DOUBLE_SLASH_LABEL_LINE = '// labels: doubleslash, foo, bar, baz';
var DOUBLE_SLASH_BODY_LINE  = '// body here';
var STAR_TODO_LINE          = '* TODO - finish these tests!';
var STAR_LABEL_LINE         = '* labels: blockcomment, foo, bar, baz';
var STAR_BODY_LINE          = '* body here';
var HASH_TODO_LINE          = '# TODO - finish these tests!';
var HASH_LABEL_LINE         = '# labels: hash, foo, bar, baz';
var HASH_BODY_LINE          = '# body here';
var EXPECTED_TODO_TITLE     = 'finish these tests!';
var EXPECTED_COMMON_LABELS  = ['foo', 'bar', 'baz'];
var EXPECTED_BODY           = 'body here';

describe('TodoUtils', function () {
  describe('#getExtension', function () {
    it('should get the extension of a Java file', function () {
      assert.strictEqual(todoUtils.getExtension('test.java'), '.java');
    });

    it('should get the extension of a Java file in a directory', function () {
      assert.strictEqual(todoUtils.getExtension(path.join(fixturesDir, 'test.java')), '.java');
    });
  });

  describe('#isTodo, #isTodoLabel, #isTodoBody', function () {
    describe('C-style comments', function () {
      it('should recognize // lines in a JavaScript file', function () {
        assert.ok(todoUtils.isTodo(DOUBLE_SLASH_TODO_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoLabel(DOUBLE_SLASH_LABEL_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoBody(DOUBLE_SLASH_BODY_LINE, 'foo.js'));
      });

      it('should not be fooled by extra white space', function () {
        assert.ok(todoUtils.isTodo('   ' + DOUBLE_SLASH_TODO_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoLabel('  \t\t' + DOUBLE_SLASH_LABEL_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoBody('\t \t' + DOUBLE_SLASH_BODY_LINE, 'foo.js'));
      });

      it('should recognize // lines in a Java file', function () {
        assert.ok(todoUtils.isTodo(DOUBLE_SLASH_TODO_LINE, 'foo.java'));
        assert.ok(todoUtils.isTodoLabel(DOUBLE_SLASH_LABEL_LINE, 'foo.java'));
        assert.ok(todoUtils.isTodoBody(DOUBLE_SLASH_BODY_LINE, 'foo.java'));
      });

      it('should recognize // lines in a Less file', function () {
        assert.ok(todoUtils.isTodo(DOUBLE_SLASH_TODO_LINE, 'foo.less'));
        assert.ok(todoUtils.isTodoLabel(DOUBLE_SLASH_LABEL_LINE, 'foo.less'));
        assert.ok(todoUtils.isTodoBody(DOUBLE_SLASH_BODY_LINE, 'foo.less'));
      });

      it('should recognize // lines in a C file', function () {
        assert.ok(todoUtils.isTodo(DOUBLE_SLASH_TODO_LINE, 'foo.c'));
        assert.ok(todoUtils.isTodoLabel(DOUBLE_SLASH_LABEL_LINE, 'foo.c'));
        assert.ok(todoUtils.isTodoBody(DOUBLE_SLASH_BODY_LINE, 'foo.c'));
      });

      it('should recognize // lines in a C++ file', function () {
        assert.ok(todoUtils.isTodo(DOUBLE_SLASH_TODO_LINE, 'foo.cpp'));
        assert.ok(todoUtils.isTodoLabel(DOUBLE_SLASH_LABEL_LINE, 'foo.cpp'));
        assert.ok(todoUtils.isTodoBody(DOUBLE_SLASH_BODY_LINE, 'foo.cpp'));
      });
    });

    describe('C-style block comments', function () {
      it('should recognize * lines in a JavaScript file', function () {
        assert.ok(todoUtils.isTodo(STAR_TODO_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoLabel(STAR_LABEL_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoBody(STAR_BODY_LINE, 'foo.js'));
      });

      it('should not be fooled by extra white space', function () {
        assert.ok(todoUtils.isTodo('   ' + STAR_TODO_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoLabel('  \t\t' + STAR_LABEL_LINE, 'foo.js'));
        assert.ok(todoUtils.isTodoBody('\t \t' + STAR_BODY_LINE, 'foo.js'));
      });

      it('should recognize * lines in a Java file', function () {
        assert.ok(todoUtils.isTodo(STAR_TODO_LINE, 'foo.java'));
        assert.ok(todoUtils.isTodoLabel(STAR_LABEL_LINE, 'foo.java'));
        assert.ok(todoUtils.isTodoBody(STAR_BODY_LINE, 'foo.java'));
      });

      it('should recognize * lines in a Less file', function () {
        assert.ok(todoUtils.isTodo(STAR_TODO_LINE, 'foo.less'));
        assert.ok(todoUtils.isTodoLabel(STAR_LABEL_LINE, 'foo.less'));
        assert.ok(todoUtils.isTodoBody(STAR_BODY_LINE, 'foo.less'));
      });

      it('should recognize * lines in a C file', function () {
        assert.ok(todoUtils.isTodo(STAR_TODO_LINE, 'foo.c'));
        assert.ok(todoUtils.isTodoLabel(STAR_LABEL_LINE, 'foo.c'));
        assert.ok(todoUtils.isTodoBody(STAR_BODY_LINE, 'foo.c'));
      });

      it('should recognize * lines in a C++ file', function () {
        assert.ok(todoUtils.isTodo(STAR_TODO_LINE, 'foo.cpp'));
        assert.ok(todoUtils.isTodoLabel(STAR_LABEL_LINE, 'foo.cpp'));
        assert.ok(todoUtils.isTodoBody(STAR_BODY_LINE, 'foo.cpp'));
      });
    });

    describe('Python-style comments', function () {
      it('should recognize # lines in a Python file', function () {
        assert.ok(todoUtils.isTodo(HASH_TODO_LINE, 'foo.py'));
        assert.ok(todoUtils.isTodoLabel(HASH_LABEL_LINE, 'foo.py'));
        assert.ok(todoUtils.isTodoBody(HASH_BODY_LINE, 'foo.py'));
      });

      it('should not be fooled by extra white space', function () {
        assert.ok(todoUtils.isTodo('   ' + HASH_TODO_LINE, 'foo.py'));
        assert.ok(todoUtils.isTodoLabel('  \t\t' + HASH_LABEL_LINE, 'foo.py'));
        assert.ok(todoUtils.isTodoBody('\t \t' + HASH_BODY_LINE, 'foo.py'));
      });

      it('should recognize # lines in a bash file', function () {
        assert.ok(todoUtils.isTodo(HASH_TODO_LINE, 'foo.bash'));
        assert.ok(todoUtils.isTodoLabel(HASH_LABEL_LINE, 'foo.bash'));
        assert.ok(todoUtils.isTodoBody(HASH_BODY_LINE, 'foo.bash'));
      });

      it('should recognize # lines in a shell file', function () {
        assert.ok(todoUtils.isTodo(HASH_TODO_LINE, 'foo.sh'));
        assert.ok(todoUtils.isTodoLabel(HASH_LABEL_LINE, 'foo.sh'));
        assert.ok(todoUtils.isTodoBody(HASH_BODY_LINE, 'foo.sh'));
      });

      it('should recognize # lines in a CoffeeScript file', function () {
        assert.ok(todoUtils.isTodo(HASH_TODO_LINE, 'foo.coffee'));
        assert.ok(todoUtils.isTodoLabel(HASH_LABEL_LINE, 'foo.coffee'));
        assert.ok(todoUtils.isTodoBody(HASH_BODY_LINE, 'foo.coffee'));
      });

      it('should recognize # lines in a Ruby file', function () {
        assert.ok(todoUtils.isTodo(HASH_TODO_LINE, 'foo.rb'));
        assert.ok(todoUtils.isTodoLabel(HASH_LABEL_LINE, 'foo.rb'));
        assert.ok(todoUtils.isTodoBody(HASH_BODY_LINE, 'foo.rb'));
      });
    });
  });

  describe('#getTodoTitle', function () {
    it('should get the todo title for a JavaScript file from a // comment', function () {
      assert.strictEqual(todoUtils.getTodoTitle(DOUBLE_SLASH_TODO_LINE, 'foo.js'), EXPECTED_TODO_TITLE);
    });

    it('should get the todo title for a JavaScript file from a block comment', function () {
      assert.strictEqual(todoUtils.getTodoTitle(STAR_TODO_LINE, 'foo.js'), EXPECTED_TODO_TITLE);
    });

    it('should get the todo title for a CoffeeScript file from a # comment', function () {
      assert.strictEqual(todoUtils.getTodoTitle(HASH_TODO_LINE, 'foo.coffee'), EXPECTED_TODO_TITLE);
    });
  });

  describe('#getTodoLabels', function () {
    it('should get the todo labels for a JavaScript file from a // comment', function () {
      assert.sameMembers(
        todoUtils.getTodoLabels(DOUBLE_SLASH_LABEL_LINE, 'foo.js'),
        ['doubleslash'].concat(EXPECTED_COMMON_LABELS));
    });

    it('should get the todo labels for a JavaScript file from a block comment', function () {
      assert.sameMembers(
        todoUtils.getTodoLabels(STAR_LABEL_LINE, 'foo.js'),
        ['blockcomment'].concat(EXPECTED_COMMON_LABELS));
    });

    it('should get the todo labels for a CoffeeScript file from a # comment', function () {
      assert.sameMembers(
        todoUtils.getTodoLabels(HASH_LABEL_LINE, 'foo.coffee'),
        ['hash'].concat(EXPECTED_COMMON_LABELS));
    });

    it('should ignore duplicates', function () {
      assert.sameMembers(
        todoUtils.getTodoLabels('// labels: foo, bar, foo, baz, foo', 'foo.js'),
        ['foo', 'bar', 'baz']);
    });
  });

  describe('#getTodoBody', function () {
    it('should get the todo body for all three types of comment', function () {
      assert.strictEqual(todoUtils.getTodoBody(DOUBLE_SLASH_BODY_LINE, 'foo.js'), EXPECTED_BODY);
      assert.strictEqual(todoUtils.getTodoBody(STAR_BODY_LINE, 'foo.java'), EXPECTED_BODY);
      assert.strictEqual(todoUtils.getTodoBody(HASH_BODY_LINE, 'foo.py'), EXPECTED_BODY);
    });
  });

  describe('Todo class', function () {
    it('should copy fields correctly upon construction', function () {
      var opts = {
        lines: ['foo', 'bar'],
        repo: 'repo',
        path: 'path',
        lineNum: 1
      };
      var todo = new Todo(opts);
      assert.deepEqual(opts.lines, todo.lines);
      assert.strictEqual(opts.repo, todo.repo);
      assert.strictEqual(opts.path, todo.path);
      assert.strictEqual(opts.lineNum, todo.lineNum);
    });

    it('should derive the title from the lines', function () {
      var opts = {
        lines: [DOUBLE_SLASH_TODO_LINE, DOUBLE_SLASH_LABEL_LINE, DOUBLE_SLASH_BODY_LINE],
        repo: 'repo',
        path: 'path.less',
        lineNum: 1
      };
      var todo = new Todo(opts);
      assert.strictEqual(EXPECTED_TODO_TITLE, todo.title());
    });
  });

  describe('#parseTodos', function () {
    it("shouldn't choke on an empty array", function () {
      assert.deepEqual(todoUtils.parseTodos([]), []);
    });

    it('should handle a (mock) JavaScript file with one body line', function () {
      var repo = 'repo';
      var mockJSFile = {path: 'foo.js', lines: [DOUBLE_SLASH_TODO_LINE, DOUBLE_SLASH_LABEL_LINE, DOUBLE_SLASH_BODY_LINE]};
      var todo = todoUtils.parseTodos([mockJSFile], repo)[0];
      assert.strictEqual(EXPECTED_TODO_TITLE, todo.title());
      assert.deepEqual(['doubleslash'].concat(EXPECTED_COMMON_LABELS), todo.labels());
      assert.strictEqual(EXPECTED_BODY, todo.body());
      assert.strictEqual(1, todo.lineNum);
      assert.strictEqual('foo.js', todo.path);
      assert.strictEqual(repo, todo.repo);
    });

    it('should handle a (mock) JavaScript file with multiple body lines', function () {
      var repo = 'repo';
      var bodyLines = ['// This is the first line.', '// This is another', '//   separated by a newline.'];
      var mockJSFile = {path: 'foo.js', lines: [DOUBLE_SLASH_TODO_LINE, DOUBLE_SLASH_LABEL_LINE].concat(bodyLines)};
      var todo = todoUtils.parseTodos([mockJSFile], repo)[0];
      assert.strictEqual(EXPECTED_TODO_TITLE, todo.title());
      assert.deepEqual(['doubleslash'].concat(EXPECTED_COMMON_LABELS), todo.labels());
      assert.strictEqual('This is the first line. This is another separated by a newline.', todo.body());
      assert.strictEqual(1, todo.lineNum);
      assert.strictEqual('foo.js', todo.path);
      assert.strictEqual(repo, todo.repo);
    });

    it('should handle the Java file in fixtures/BlockComments.java', function () {
      var repo = 'repo';
      var filepath = path.join(fixturesDir, 'BlockComments.java');
      var testFile = {path: filepath, lines: fs.readFileSync(filepath, 'utf8').split('\n')};
      var todo = todoUtils.parseTodos([testFile], repo)[0];

      assert.strictEqual('abc123', todo.title());
      assert.deepEqual(['abc', '123', 'test'], todo.labels());
      assert.strictEqual('body1 body2 bodybodybody', todo.body());
      assert.strictEqual(3, todo.lineNum);
      assert.strictEqual(filepath, todo.path);
      assert.strictEqual(repo, todo.repo);
    });

    it('should handle the Python file in fixtures/MultipleComments.py', function () {
      var repo = 'repo';
      var filepath = path.join(fixturesDir, 'MultipleComments.py');
      var testFile = {path: filepath, lines: fs.readFileSync(filepath, 'utf8').split('\n')};
      var todos = todoUtils.parseTodos([testFile], repo);
      assert.strictEqual('comment1', todos[0].title());
      assert.deepEqual([], todos[0].labels());
      assert.strictEqual('I am comment 1', todos[0].body());
      assert.strictEqual(1, todos[0].lineNum);
      assert.strictEqual(filepath, todos[0].path);
      assert.strictEqual(repo, todos[0].repo);

      assert.strictEqual('comment2', todos[1].title());
      assert.deepEqual(['python'], todos[1].labels());
      assert.strictEqual('I am comment 2. I have two lines.', todos[1].body());
      assert.strictEqual(8, todos[1].lineNum);
      assert.strictEqual(filepath, todos[1].path);
      assert.strictEqual(repo, todos[1].repo);
    });

    it('should handle the Less file in fixtures/mixed-comments.less', function () {
      var repo = 'repo';
      var filepath = path.join(fixturesDir, 'mixed-comments.less');
      var testFile = {path: filepath, lines: fs.readFileSync(filepath, 'utf8').split('\n')};
      var todos = todoUtils.parseTodos([testFile], repo);

      assert.strictEqual('Add some todo stuff', todos[0].title());
      assert.deepEqual(['block'], todos[0].labels());
      assert.strictEqual('We really need some content for these tests.', todos[0].body());
      assert.strictEqual(4, todos[0].lineNum);
      assert.strictEqual(filepath, todos[0].path);
      assert.strictEqual(repo, todos[0].repo);

      assert.strictEqual('Add some inline comments too.', todos[1].title());
      assert.deepEqual(['inline'], todos[1].labels());
      assert.strictEqual('The // club needs some love too!', todos[1].body());
      assert.strictEqual(12, todos[1].lineNum);
      assert.strictEqual(filepath, todos[1].path);
      assert.strictEqual(repo, todos[1].repo);

      assert.strictEqual('Write the tests for this fixture', todos[2].title());
      assert.deepEqual(['block'], todos[2].labels());
      assert.strictEqual('We really need some tests for this content.', todos[2].body());
      assert.strictEqual(16, todos[2].lineNum);
      assert.strictEqual(filepath, todos[2].path);
      assert.strictEqual(repo, todos[2].repo);
    });
  });
});
