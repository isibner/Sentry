gulp = require 'gulp'
coffeelint = require 'gulp-coffeelint'

gulp.task 'lint:coffee', ->
  gulp.src(['{app, config, lib, test}/**/*.coffee', '*.coffee'])
    .pipe(do coffeelint)
    .pipe(do coffeelint.reporter)
