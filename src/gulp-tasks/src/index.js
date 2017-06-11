import registerReleaseTasks from './release';

/**
 * Register tasks to the given Gulp instance.
 */
export default function registerTasks(gulp) {
  registerReleaseTasks(gulp);
}
