import gulp from 'gulp';
import {log} from 'gulp-util';
import Enquirer from 'enquirer';
import promptTypes from 'enquirer-prompts';

import './dotfiles';

gulp.task('hello', async function () {
  const enq = new Enquirer();
  enq.use(promptTypes);
  enq.question('name', 'What is your name?');
  enq.question('best', {
    type: 'list',
    choices: ['Bears', 'Beets', 'Battlestar Galactica'],
  });
  const {name, best} = await enq.ask();
  log('Hello, ' + name);
  log(best + ' is best');
});
