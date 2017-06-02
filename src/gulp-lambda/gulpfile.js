const gulp = require('gulp');
const register = require('./gulpv4');

register(gulp, '../gulp-lambda', {
  dest: 'dist',
});
