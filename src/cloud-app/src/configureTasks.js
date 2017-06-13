import {log, colors} from 'gulp-util';
import {readFileSync} from 'fs';
import toPromise from 'stream-to-promise';

import {creator, reader, fromContents} from './util';

import gulpRunner from './gulp';
import pkgRunner from './package';

/**
 * Execute the passed runners.
 */
function runAll(create, runners) {
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
    try {
      await runPhase('prompt', context);
      await runPhase('write', context);
      await runPhase('install', context);
    } catch (error) {
      log(colors.red('Error!'));
      log(error);
    } finally {
      await toPromise(create('.', fromContents(
        '.cloudapprc', JSON.stringify(context.cloudapprc, null, 2)
      )));
    }
  };
}

/**
 * Set up Gulp tasks for the given command and args.
 */
export default function configureTasks(args, env) {
  const create = creator(args, env);
  const src = reader(args, env);

  const cloudapprc = {};
  const cloudapprcPath = env.configFiles['.cloudapp'].path;
  if (cloudapprcPath) {
    try {
      Object.assign(JSON.parse(readFileSync(cloudapprcPath)));
    } catch (err) {
      log(colors.red('Error reading .cloudapprc'));
      log(`Invalid JSON in ${cloudapprcPath}, or could not find file.`);
      log('Please correct the file manually, or delete it.');
      process.exit(-1);
    }
  }

  const generateProject = runAll(create, [pkgRunner, gulpRunner].map(
    (fn) => fn(args, env, create, src)));

  return {
    new: () => generateProject({cloudapprc}),
  };
}
