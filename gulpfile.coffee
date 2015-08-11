gulp = require 'gulp'
coffeelint = require 'gulp-coffeelint'
cslint = require 'gulp-cslint'

gulp.task 'lint:coffee', ->
  gulp.src(['{app,config,lib,test}/**/*.coffee', '*.coffee'])
    .pipe(do coffeelint)
    .pipe(do coffeelint.reporter)

gulp.task 'lint:cslint', ['lint:coffee'], ->
  gulp.src(['{app, config, lib, test}/**/*.coffee', '*.coffee', '!{Service,Source}Template.coffee'])
    .pipe(do cslint)
    .pipe(do cslint.format)

gulp.task 'lint', ['lint:cslint']
