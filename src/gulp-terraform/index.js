// @flow
const decamelize = require('decamelize');
const _ = require('lodash');
const makeRunner = require('@kennship/gulp-execute');


/*::
type TfRunCommandOpts = {|
  terraformPath?: string,
  args?: {[argName: string]: string | Array<string>},
  vars?: {[varName: string]: string | number | boolean},
  env?: {[envVarName: string]: string},
  clobberEnv?: boolean,
  cwd?: string,
  runner?: (args: string, opts: Object) => Promise<void>,
|}

declare function runCommand(
  cmd: string, opts?: TfRunCommandOpts
): Promise<void>;

declare function runCommand(
  cmd: string, positionalArgs: (string | Array<string>), opts?: TfRunCommandOpts
): Promise<void>;
*/

/**
 * Given a camel-cased key, turn it into a hyphenated CLI flag in the style
 * expected by Terraform.
 *
 * @example cliFlagFromKey('varFile'); // > '-var-file'
 */
function cliFlagFromKey(key) {
  return `-${decamelize(key, '-')}`;
}

/**
 * Default function converting options to CLI flags.
 *
 * @example defaultToArgs('foo', 'bar'); // > ['-foo=bar']
 */
function defaultToArgs(key, value, command) {
  const flag = cliFlagFromKey(key);
  if (value === true) return [flag];
  return [`${flag}=${value}`];
}

/**
 * Function that converts options to CLI flags where the flags are expected
 * to be separated from their values by a space.
 *
 * @example spacedArgs('var', 'foo=bar'); // > ['-var', 'foo=bar']
 */
function spacedArgs(key, value, command) {
  return [cliFlagFromKey(key), value];
}

/**
 * Properties for specially-handled Terraform CLI flags.
 */
const TERRAFORM_CLI_FLAG_PROPERTIES = {
  var: {
    toArgs: spacedArgs,
  },
  color: {
    toArgs(key, value, command) {
      switch (value) {
        case true: return [];
        case false: return ['-no-color'];
        default: return [];
      }
    },
  },
};

/**
 * Run Terraform command.
 */
function runCommand(
  cmd/*: string */,
  maybeOptsOrPositionalArgs/*:
    void | string | Array<string> | TfRunCommandOpts
  */,
  maybeOpts/*: void | TfRunCommandOpts */
)/*: Promise<void> */ {
  let positionalArgs = [];
  let opts;

  switch (true) {
    case Array.isArray(maybeOptsOrPositionalArgs):
      positionalArgs = maybeOptsOrPositionalArgs;
      break;
    case typeof maybeOptsOrPositionalArgs === 'string':
      positionalArgs = [maybeOptsOrPositionalArgs];
      break;
    case maybeOptsOrPositionalArgs === undefined:
      break;
    default:
      opts = maybeOptsOrPositionalArgs;
      break;
  }

  if (opts === undefined) {
    if (maybeOpts === undefined) {
      opts = {};
    } else {
      opts = maybeOpts;
    }
  }

  const terraformPath = opts.terraformPath || 'terraform';
  const runner = opts.runner || makeRunner(terraformPath, {
    shortName: opts.shortName || 'tf',
  });

  const optionArgs = _(opts.args)
    .toPairs()
    .map(([argKey, argValue]) => {
      const specialProps = TERRAFORM_CLI_FLAG_PROPERTIES[argKey];
      const toArgs = _.get(specialProps, ['toArgs'], defaultToArgs);
      if (_.isArray(argValue)) {
        return _.flatten(argValue.map((value) => toArgs(argKey, value, cmd)));
      }
      return toArgs(argKey, argValue, cmd);
    })
    .flatten()
    .valueOf();

  const envVars = Object.assign(
    {}, (opts.clobberEnv ? {} : process.env), opts.env
  );

  if (opts.vars) {
    Object.keys(opts.vars).forEach((varKey) => {
      const varValue = opts.vars[varKey];
      const envVarName = `TF_VAR_${varKey}`;
      envVars[envVarName] = varValue;
    });
  }

  return runner(
    [cmd].concat(optionArgs).concat(positionalArgs),
    {
      cwd: _.get(opts, ['cwd'], process.cwd()),
      env: envVars,
    }
  );
}

/**
 * Create a convenience function for running a given command.
 */
function commandRunner(cmd) {
  return (...args) => runCommand(cmd, ...args);
}

module.exports = {
  runCommand,
};

[
  'apply',
  'destroy',
  'get',
  'import',
  'init',
  'output',
  'plan',
  'push',
  'refresh',
  'show',
  'taint',
  'untaint',
  'validate',
  'version',
].forEach((commandName) => {
  module.exports[commandName] = commandRunner(commandName);
});
