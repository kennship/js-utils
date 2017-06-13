import gulp from 'gulp';
import watch from 'gulp-watch';
import mocha from 'gulp-spawn-mocha';
import {clientSource, tests} from './paths';

const testOptions = {
  reporter: 'spec',
};

gulp.task('test', () =>
  gulp.src(tests(clientSource))
    .pipe(mocha({
      ...testOptions,
      istanbul: true,
    }))
);

gulp.task('test.watch', () =>
  watch(tests(clientSource))
    .pipe(mocha(testOptions))
);
