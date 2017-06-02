const zip = require('gulp-zip');
const merge = require('merge-stream');
const _ = require('lodash');
const {basename, join} = require('path');

const npmInstall = require('./npm');
const rollup = require('./rollup');

/**
 * Function that accepts a callback and returns the result of that callback.
 */
const call = (fn) => fn();

/**
 * Generate a task name for the lambda.
 * @param lambdaName Name of the lambda funciton.
 * @param task       Task name.
 * @param opts       Original options.
 */
function taskName(lambdaName, task, opts) {
  const taskParentName = _.get(opts, 'lambdaName', 'lambda');
  if (task === 'generate') return taskParentName;
  return `${taskParentName}.${task}`;
}

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
function createTasks(gulp, path, origOpts) {
  const lambdaName = _.get(origOpts, 'lambdaName', basename(path));
  const opts = _.assign({lambdaName}, origOpts);
  const createTaskName = _.get(opts, 'taskName', taskName);

  const npmTaskName = createTaskName(lambdaName, 'npm-install', origOpts);
  const bundleTaskName = createTaskName(lambdaName, 'bundle', origOpts);
  const nodeModulesPath = join(path, 'node_modules/**');

  // Define a series of functions, each of which supplies one or more files
  // which will be merged into the bundle.
  const inputs = [
    // Rolled-up Lambda source.
    () => rollup(path, opts),

    // `package.json`.
    () => gulp.src(join(path, 'package.json')),

    // The Lambda's dependencies.
    () => gulp.src(nodeModulesPath, {base: path}),
  ];

  // If we want to add additional resources, create the function and add it to
  // our list of inputs.
  const resourceOpt = _.get(opts, 'resources');
  const resolveToBase = (relativePath) => join(path, relativePath);
  if (_.isArray(resourceOpt)) {
    inputs.push(() => gulp.src(resourceOpt.map(resolveToBase)));
  } else if(_.isString(resourceOpt)) {
    inputs.push(() => gulp.src(resolveToBase(resourceOpt)));
  } else if(_.isFunction(resourceOpt)) {
    inputs.push(resourceOpt);
  }

  const npm = () => npmInstall(path);
  Object.defineProperty(npm, 'name', {value: npmTaskName});
  npm.description = `Run "npm install" for the "${lambdaName}" lambda`;

  const bundle = () => merge(...inputs.map(call))
    .pipe(zip(path, opts))
    // TODO: should not need `${lambdaName}.zip` here... `gulp.dest` should just
    // be a directory... right?
    .pipe(gulp.dest(join(opts.dest, `${lambdaName}.zip`)));
  Object.defineProperty(bundle, 'name', {value: bundleTaskName});
  bundle.description = `Create the zipfile for the "${lambdaName}" lambda`;

  return {npm, bundle, lambdaName};
}

module.exports = createTasks;
createTasks.taskName = taskName;
