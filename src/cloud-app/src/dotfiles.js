import {fromContents} from './util';

/**
 * Generate a `.eslintrc` file.
 */
export function eslintrc({env = 'node'} = {}) {
  return fromContents('.eslintrc', `# .eslintrc

extends: kennship/config
env:
  ${env}: true
`);
}

/**
 * Generate a default `.gitignore` file.
 */
export function gitignore() {
  return fromContents('.gitignore', `# .gitignore
node_modules/

.*.sw*
*~
`);
}
