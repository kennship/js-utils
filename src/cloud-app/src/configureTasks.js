import {log, colors} from 'gulp-util';

import {creator, reader} from './util';

import gulpRunner from './gulp';
import pkgRunner from './package';

/**
 * Execute the passed runners.
 */
function runAll(runners) {
  /**
   * Run the named phase in all task runners.
   */
  async function runPhase(phase, context) {
    for (let i = 0; i < runners.length; i++) {
      const name = runners[i].name;
      const fn = runners[i][phase];
      if (typeof fn === 'function') {
        log(colors.cyan(`[${name}.${phase}]`));
        await fn.call(context);
      }
    }
  }
  return async function run(context) {
    await runPhase('prompt', context);
    await runPhase('write', context);
    await runPhase('install', context);
  };
}

/**
 * Set up Gulp tasks for the given command and args.
 */
export default function configureTasks(args, env) {
  const create = creator(args, env);
  const src = reader(args, env);

  const generateProject = runAll([pkgRunner, gulpRunner].map(
    (fn) => fn(args, env, create, src)));

  return {
    new: () => generateProject({}),
  };
}
