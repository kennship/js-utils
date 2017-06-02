const makeRunner = require('@kennship/gulp-execute');
const {resolve} = require('path');

const npm = makeRunner('npm');

/**
 * Run `npm install` for the given path.
 * @param  path Path to package.
 * @return Promise that resolves once installation is complete.
 */
function runNpmInstall(path/*: string */)/*: Promise<void> */ {
  return npm(['install'], {
    cwd: resolve(process.cwd(), path),
  });
}

module.exports = runNpmInstall;
