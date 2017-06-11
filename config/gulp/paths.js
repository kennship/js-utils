import {resolve, join} from 'path';

export const projectRoot = resolve(__dirname, '..');
export const source = (pkgName, path = 'index.js') =>
  join(projectRoot, `src/${pkgName}`, path);
export const dist = (path) =>
  join(projectRoot, 'dist', path);
export const tests = (dir) =>
  join(dir, '**/*.test.js');

// ## Client files
export const clientSource = source('client');
export const clientDist = dist('client');
