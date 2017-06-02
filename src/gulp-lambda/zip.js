const zip = require('gulp-zip');

/**
 * Create a `TransformStream` that will zip the files it's given.
 */
function createLambdaZip(path, opts) {
  const zipName = `${opts.lambdaName}.zip`;
  return zip(zipName);
}

module.exports = createLambdaZip;
