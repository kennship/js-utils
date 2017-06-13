import toPromise from 'stream-to-promise';
import {fromContents} from './util';

/**
 * Generate Gulp entry file.
 */
export function gulpfile() {
  return fromContents('gulpfile.js', `// gulpfile.js
require('babel-polyfill');
require('kn-babel').register();
require('./config/gulp');
`);
}

/**
 * Generate stub Gulp tasks file.
 */
export function gulpTasksIndex() {
  return fromContents('index.js', `// index.js
import registerTasks from '@kennship/gulp-tasks';
registerTasks(require('gulp'));
`);
}

/**
 * Set configuration for Gulpfile.
 */
export default function configureGulp(args, env, create) {
  return {
    name: 'gulp',
    async write() {
      await Promise.all([
        create('config/gulp', gulpTasksIndex()),
        create('.', gulpfile()),
      ].map((stream) => toPromise(stream)));
    },
  };
}
