import 'babel-polyfill';
import Liftoff from 'liftoff';
import yargs from 'yargs';
import {readFileSync} from 'fs';
import {join} from 'path';
import {log} from 'gulp-util';

import './default';
import configureTasks from './configureTasks';

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json')));

/**
 * Create a CLI object to launch the program.
 */
function makeCli(argv = process.argv.slice(2)) {
  const cli = new Liftoff({
    moduleName: pkg.name,
    processTitle: pkg.name,
    configName: '.cloudapp',
    extensions: {rc: null},
    configFiles: {
      '.cloudapp': {
        path: '.',
        extensions: {rc: null},
        findUp: true,
      },
    },
  });

  cli.launch = () => {
    const args = yargs
      .usage(`Usage: $0 <command> [options]`)
      .command('new', 'Create a new project repository')
      .demandCommand(1)
      .version(pkg.version)
      .help()
      .parse(argv);
    const cmd = args._[0];

    const opts = {};

    Liftoff.prototype.launch.call(cli, opts, async (env) => {
      const commands = configureTasks(args, env);

      if (cmd && commands[cmd]) {
        await commands[cmd]();
        log('Finished.');
      }
    });
  };
  return cli;
}

export default makeCli();
