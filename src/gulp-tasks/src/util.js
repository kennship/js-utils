import gulp from 'gulp';
import through2 from 'through2';
import fromSource from 'vinyl-source-stream';
import {resolve} from 'path';

/**
 * Make a single-file stream from filename and contents.
 */
export function fromContents(filename, source) {
  const input = through2();
  const output = input.pipe(fromSource(filename));
  input.push(source);
  input.end();
  return output;
}

/**
 * Create a convenience function for piping a stream to the destination.
 *
 * @example
 *     const create = creator(args, env);
 *     gulp.task('eslintrc', () => create('.', eslintrc()));
 */
export function creator(args, env) {
  const {cwd} = env;
  return function create(dir, stream) {
    return stream.pipe(gulp.dest(dir, {cwd}));
  };
}

/**
 * Create a convenience function for reading files from the destination.
 */
export function reader(args, env) {
  const {cwd} = env;
  return function src(globs, opts = {}) {
    const base = opts.base ? resolve(cwd, opts.base) : cwd;
    return gulp.src(globs, {...opts, base});
  };
}
