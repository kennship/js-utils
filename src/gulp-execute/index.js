const gutil = require('gulp-util');
const childProcess = require('child_process');

// Match on arguments that don't need to be quoted.
const UNQUOTED_ARG = /^[A-Z0-9-=_.\/]+$/i;

const displayArg = (str/*: string */) => UNQUOTED_ARG.test(str)
  ? str
  : JSON.stringify(str);

module.exports = function makeRunner(
  executable/*: string */,
  runnerOpts/*: RunnerOpts */ = {}
)/*: Runner */ {
  const {
    displayName = executable,
    shortName = displayName,
  } = runnerOpts;
  return function run(
    args/*: Array<string> */, opts/*: Object */ = {}
  )/*: Promise<void> */ {
    return new Promise((ok/*: () => void */, fail/*: (Error) => void */) => {
      const runningProcess = childProcess.spawn(
        executable, args,
        Object.assign({
          cwd: process.cwd(),
        }, opts, {
          env: Object.assign({}, process.env, opts.env),
        })
      );
      gutil.log(
        gutil.colors.green(`$ ${gutil.colors.bold(displayName)} %s`),
        args.map(displayArg).join(' ')
      );
      runningProcess.stdout.on('data', (data/*: Buffer */) => {
        data.toString().replace(/\n$/, '')
        .split('\n')
        .forEach((line/*: string */) => gutil.log('[%s] %s',
          gutil.colors.blue.bold(shortName),
          line));
      });
      runningProcess.stderr.on('data', (data/*: Buffer */) => {
        data.toString().replace(/\n$/, '')
        .split('\n')
        .forEach((line/*: string */) => gutil.log('[%s] %s',
          gutil.colors.red.bold(shortName),
          line));
      });
      runningProcess.on('close', (code/*: number */) => {
        if (code) {
          fail(new gutil.PluginError(
            '@kennship/gulp-execute', `${displayName} exited with code ${code}`
          ));
        } else {
          gutil.log(gutil.colors.green(`${displayName} finished successfully`));
          ok();
        }
      });
    });
  };
};
