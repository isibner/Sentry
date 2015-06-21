module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    eslint: {
      options: {
        rulePaths: ['.eslint_rules']
      },
      target: ['*.js', 'config/**/*.js', 'utils/*', 'app/**/*.js', 'test/**/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*Spec.js']
      }
    }
  });

  grunt.registerTask('default', ['eslint', 'mochaTest']);
};
