const log = require('fancy-log');
const childProcess = require('child_process');
const stripAnsi = require('strip-ansi');
const colors = require('ansi-colors');
const PluginError = require('plugin-error');

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
      const stdout = [];
      const stderr = [];
      const runningProcess = childProcess.spawn(
        executable, args,
        Object.assign({
          cwd: process.cwd(),
        }, opts, {
          env: Object.assign({}, process.env, opts.env),
        })
      );
      log(
        colors.green(`$ ${colors.bold(displayName)} %s`),
        args.map(displayArg).join(' ')
      );
      runningProcess.stdout.on('data', (data/*: Buffer */) => {
        data.toString().replace(/\n$/, '')
        .split('\n')
        .forEach((line/*: string */) => {
          line = stripAnsi(line);
          stdout.push(line);
          log('[%s] %s', colors.blue.bold(shortName), line);
        });
      });
      runningProcess.stderr.on('data', (data/*: Buffer */) => {
        data.toString().replace(/\n$/, '')
        .split('\n')
        .forEach((line/*: string */) => {
          line = stripAnsi(line);
          stderr.push(line);
          log('[%s] %s', colors.red.bold(shortName), line)
        });
      });
      runningProcess.on('close', (code/*: number */) => {
        if (code) {
          fail(new PluginError(
            '@kennship/gulp-execute', 
            `${displayName} exited with code ${code}. Error: ${stderr.join('\n').trim()}`
          ));
        } else {
          log(colors.green(`${displayName} finished successfully`));
          ok(stdout);
        }
      });
    });
  };
};
