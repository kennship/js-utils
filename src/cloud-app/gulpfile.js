const gulp = require('gulp');
const rollupPkg = require('@kennship/gulp-lambda/rollup');
const createBabelConfig = require('kn-babel');
const babel = require('rollup-plugin-babel');

gulp.task('bundle', () =>
  rollupPkg(process.cwd(), {
    entry: 'src/index.js',
    rollup: {
      plugins: [
        babel(createBabelConfig({runtime: 'node', modules: false})),
      ],
    },
  })
  .pipe(gulp.dest('dist'))
);
