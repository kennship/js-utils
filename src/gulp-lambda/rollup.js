const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const _ = require('lodash');
const {join, basename} = require('path');

/**
 * Run a package's source through Rollup.
 *
 * By default, the lambda entry is assumed to be `index.js` unless otherwise
 * specified.
 *
 * @param path {string} Path to the package containing the lambda code.
 * @param [opts] Options.
 * @param [opts.rollup] {Object} Rollup configuration.
 * @param [opts.entry='index.js'] {string}
 *        Entry path of lambda relative to `path`.
 * @param [opts.lambdaName=basename(path)] {string}
 *        Module name of the lambda.
 * @param [opts.sourceMap=false] {boolean}
 *        Whether to generate a sourcemap for the lambda code.
 */
function rollupLambdaSource(path, opts) {
  const sourceMap = Boolean(opts.sourceMap);
  const entry = join(path, opts.entry || 'index.js');
  const rollupConfig = _.assign({
    format: 'cjs',
    moduleName: opts.lambdaName || basename(path),
    sourceMap,
    external: ['node_modules/**'],
  }, _.get(opts, ['rollup'], {}), {entry});
  return rollup(rollupConfig)
    .pipe(source(basename(entry)));
}

module.exports = rollupLambdaSource;
