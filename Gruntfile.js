module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    eslint: {
      options: {
        rulePaths: ['.eslint_rules']
      },
      target: ['*.js', 'config/**/*.js', 'app/**/*.js']
    }
  });

  grunt.registerTask('default', ['eslint']);
};
