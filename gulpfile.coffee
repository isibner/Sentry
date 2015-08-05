gulp = require 'gulp'
coffeelint = require 'gulp-coffeelint'
cslint = require 'gulp-cslint'

console.log cslint

gulp.task 'lint:coffee', ->
  gulp.src(['{app,config,lib,test}/**/*.coffee', '*.coffee'])
    .pipe(do coffeelint)
    .pipe(do coffeelint.reporter)

gulp.task 'lint:cslint', ['lint:coffee'], ->
  gulp.src(['{app, config, lib, test}/**/*.coffee', '*.coffee', '!Example{Service,SourceProvider}.coffee'])
    .pipe(do cslint)
    .pipe(do cslint.format)

gulp.task 'lint', ['lint:cslint']
