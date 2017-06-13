import {log, colors} from 'gulp-util';
import map from 'through2-map';
import sortPkg from 'sort-package-json';
import {prompt} from 'inquirer';
import exec from 'exec-then';
import ini from 'ini';
import {basename} from 'path';
import validatePackageName from 'validate-npm-package-name';
import toPromise from 'stream-to-promise';

import {fromContents, tpl} from './util';
import {eslintrc, gitignore} from './dotfiles';
import DEPENDENCIES from './dependencies';

/**
 * Add the pinned version of the given dependency to the given object.
 */
function addDependency(dependencies, pkgName) {
  dependencies[pkgName] = DEPENDENCIES.versions[pkgName] || '*';
}

/**
 * Generate or update `package.json`.
 */
export function packageJson(origPkg) {
  const pkg = origPkg || {};
  const responses = this.packageJsonResponses; // eslint-disable-line no-invalid-this, max-len
  if (responses && !origPkg) {
    const repoName = responses.name.match(/[^/]+$/)[0];
    const repo = `https://github.com/${responses.githubAccount}/${repoName}`;
    Object.assign(pkg, {
      name: responses.name,
      version: '0.0.0-develop',
      license: responses.isPublic ? 'MIT' : 'UNLICENSED',
      bugs: {url: `${repo}/issues`},
      repository: {type: 'git', url: `${repo}.git`},
      dependencies: {},
      devDependencies: {},
    });

    if (responses.description) {
      pkg.description = responses.description;
    }

    if (responses.authorName) {
      if (responses.authorEmail || responses.authorUrl) {
        pkg.author = {
          name: responses.authorName,
        };
        if (responses.authorEmail) pkg.author.email = responses.authorEmail;
        if (responses.authorUrl) pkg.author.url = responses.authorUrl;
      } else {
        pkg.author = responses.authorName;
      }
    }

    if (!responses.isPublic) {
      pkg.private = true;
    }

    [
      'kn-babel',
      'gulp',
      'gulp-cli',
      'eslint',
      'eslint-config-kennship',
      'babel-loader',
      '@kennship/gulp-tasks',
      '@kennship/gulp-terraform',
      '@kennship/gulp-lambda',
    ].forEach((dep) => addDependency(pkg.devDependencies, dep));
  }

  const sortedPkg = sortPkg(pkg);
  return fromContents('package.json', JSON.stringify(sortedPkg, null, 2));
}

/**
 * Create task to prompt the user for information about their package.
 */
export async function promptPkgJson(origPkg, args, env) {
  if (origPkg) return;

  const npmrc = ini.parse((await exec('npm config ls -l')).stdout);
  const responses = this.packageJsonResponses = {}; // eslint-disable-line no-invalid-this, max-len

  Object.assign(responses, await prompt([{
    type: 'input',
    name: 'name',
    message: 'Package name?',
    default: basename(env.cwd),
    validate: (s) => {
      const validation = validatePackageName(s);
      if (!validation.validForNewPackages) {
        return [
          ...(validation.errors || []),
          ...(validation.warnings || []),
        ].join(';');
      }
      return true;
    },
  }, {
    type: 'input',
    name: 'description',
    message: 'Brief package description?',
  }, {
    type: 'confirm',
    name: 'isPublic',
    message: 'Is this a public project?',
    default: false,
  }, {
    type: 'input',
    name: 'githubUsername',
    message: 'Your GitHub username?',
    when: () => !npmrc['github.username'],
  }, {
    type: 'input',
    name: 'githubAccount',
    message: 'GitHub account for the project\'s repo?',
    default: npmrc['github.username'],
  }, {
    type: 'input',
    name: 'authorName',
    message: 'Your name?',
    default: npmrc['init.author.name'] || npmrc['init-author-name'],
  }, {
    type: 'input',
    name: 'authorEmail',
    message: 'Your email (this will be public)?',
    default: npmrc['init.author.email'] || npmrc['init-author-email'],
  }, {
    type: 'input',
    name: 'authorUrl',
    message: 'Your website?',
    default: npmrc['init.author.url'] || npmrc['init-author-url'],
  }]));

  if (!npmrc['github.username']) {
    await exec([
      ...('npm config set github.username'.split(' ')),
      responses.githubUsername,
    ]);
  }
}

/**
 * Create tasks for package config.
 */
export default function configurePackage(args, env, create, src) {
  /**
   * Prompt the user for their package information.
   */
  async function promptPackageInfo() {
    log('reading package.json');
    await toPromise(src('package.json')
      .pipe(map.obj((pkgFile) => {
        try {
          this.pkgJsonContents = JSON.parse(pkgFile.contents.toString()); // eslint-disable-line no-invalid-this, max-len
        } catch (parseError) {
          log(colors.red(`Error reading package.json`));
          log(parseError);
        }
      })));
    await promptPkgJson.call(this, this.pkgJsonContents, args, env); // eslint-disable-line no-invalid-this, max-len
  }

  /**
   * Write the files to disk.
   */
  async function writePackageFiles() {
    await Promise.all([
      create('.', packageJson.call(this, this.packageJsonContents)), // eslint-disable-line no-invalid-this, max-len
      create('.', eslintrc()),
      create('.', gitignore()),
      create('.', tpl('general/**')),
    ].map((stream) => toPromise(stream)));
  }

  return {name: 'project', prompt: promptPackageInfo, write: writePackageFiles};
}
