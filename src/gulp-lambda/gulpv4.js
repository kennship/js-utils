const _ = require('lodash');

const createTasks = require('./tasks');

/**
 * Create the Gulp tasks and return a hash.
 *
 * @param gulp Gulp instance.
 * @param path Path to lambda function package.
 * @param opts Options.
 * @param opts.dest {string} Destination directory for the zipfile.
 * @param [opts.resources] {function|string|Array<string>}
 *        Resources to bundle along with the lambda. You may supply a string or
 *        array of strings, which will be passed along to `gulp.src()`, or you
 *        may supply a function which returns a stream.
 * @param [opts.rollup] {Object} Rollup configuration.
 * @param [opts.entry='index.js'] {string}
 *        Entry path of lambda relative to `path`.
 * @param [opts.lambdaName=basename(path)] {string}
 *        Module name of the lambda.
 * @param [opts.sourceMap=false] {boolean}
 *        Whether to generate a sourcemap for the lambda code.
 */
function registerTasks(gulp, path, opts) {
  const tasks = createTasks(gulp, path, opts);
  const createTaskName = _.get(opts, 'taskName', createTasks.taskName);

  const generateLambda = gulp.series(tasks.npm, tasks.bundle);
  generateLambda.displayName = createTaskName(
    tasks.lambdaName, 'generate', opts);

  gulp.task(tasks.npm);
  gulp.task(tasks.bundle);
  gulp.task(generateLambda);

  return Object.assign({}, tasks, {
    lambda: generateLambda,
  });
}

module.exports = registerTasks;
