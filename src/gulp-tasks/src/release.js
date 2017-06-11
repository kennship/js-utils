import {log, colors} from 'gulp-util';
import simpleGit from 'simple-git/promise';
import toPromise from 'stream-to-promise';
import {prompt} from 'inquirer';
import semver from 'semver';
import sortPkg from 'sort-package-json';
import streamMap from 'through2-map';
import {basename, dirname} from 'path';
import {fromContents} from './util';

const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const vfile = (stream) => new Promise((ok, fail) => {
  let result;
  stream.on('data', (file) => {
    result = file;
  });
  stream.on('end', () => ok(result));
});

vfile.json = async function vfileJson(stream) {
  const file = await vfile(stream);
  return JSON.parse(file.contents.toString());
};

vfile.packages = async function vfilePackages(stream) {
  return new Promise((ok, fail) => {
    let result = [];
    stream.on('data', (file) => {
      try {
        const json = JSON.parse(file.contents.toString());
        const dir = basename(dirname(file.path));
        result.push({json, dir});
      } catch (err) {
        log(err);
      }
    });
    stream.on('end', () => ok(result));
  });
};

/**
 * Prompt user for information about the release.
 */
async function releaseBeginPrompt(gulp) {
  // TODO: read package names from `package.json`, not directory structure
  const packages = (await vfile.packages(gulp.src('src/*/package.json')));

  const {releasedPackage} = await prompt([{
    type: 'list',
    name: 'releasedPackage',
    message: 'Which package would you like to release?',
    choices: packages.map((pkg) => ({
      name: `${pkg.json.name}: ${pkg.json.description}`,
      short: pkg.json.name,
      value: pkg,
    })),
  }]);

  const version = releasedPackage.json.version;
  const isPreV1 = semver.lt(version, '1.0.0');

  const releaseDescriptions = [
    ...(!isPreV1 ? ['minor bugfixes and improvements'] : []),
    'backwards-compatible improvements',
    'breaking API changes',
    ...(isPreV1 ? ['declare a 1.0'] : []),
  ];
  const choices = [{
    key: 'patch',
  }, {
    key: 'minor',
  }, {
    key: 'major',
  }].map((choice, i) => ({
    ...choice,
    description: releaseDescriptions[i],
  }));

  const {incrementType} = await prompt([{
    type: 'list',
    name: 'incrementType',
    message: 'What type of release is this?',
    choices: choices.map((choice) => ({
      name: `${cap(choice.key)}: ${choice.description}`,
      short: cap(choice.key),
      value: choice.key,
    })),
  }]);
  const newVersion = semver.inc(version, incrementType);

  return {incrementType, releasedPackage, newVersion};
}

/**
 * Update the changelog for this release.
 */
async function createChangelog(gulp, packageDir, newVersion) {
  const git = simpleGit();
  const allTags = (await git.tags()).filter(
    (tag) => tag.indexOf(`${packageDir}/`) === 0);
  allTags.sort((a, b) => {
    const versionA = a.replace(`${packageDir}/`, '');
    const versionB = b.replace(`${packageDir}/`, '');
    // Sort in reverse order since we want the most recent.
    return semver.compare(versionB, versionA);
  });
  const mostRecentRelease = allTags[0];
  const rawCommitLog = (await git.log([
      '--no-merges', '--no-decorate',
      // List tags since the most recent release if it exists, or since
      // the start of the repo otherwise.
      ...(mostRecentRelease ? [mostRecentRelease] : []),
      '--', `src/${packageDir}/**`,
    ])).all;

  const CHANGELOG_PATH = `src/${packageDir}/CHANGELOG.md`;
  const prevChangelog = await vfile(gulp.src(CHANGELOG_PATH));
  const prevChangelogContents = prevChangelog
    ? prevChangelog.contents.toString().split('\n').slice(2)
    : '';
  const proposedReleaseNotes = [
    `## v${newVersion}\n`,
    ...rawCommitLog.map((logEntry) => logEntry.message.split('\n')[0]),
  ].join('\n');

  const {releaseNotes} = await prompt([{
    type: 'editor',
    name: 'releaseNotes',
    message: 'Edit the release notes',
    default: proposedReleaseNotes,
  }]);
  const nextChangelogContents = [
    '# Changelog\n',
    releaseNotes,
    '\n',
    ...prevChangelogContents,
  ].join('\n');


  await toPromise(fromContents('CHANGELOG.md', nextChangelogContents)
    .pipe(gulp.dest(dirname(CHANGELOG_PATH))));
  await git.commit(
    `Update changelog for ${packageDir} v${newVersion} release`,
    CHANGELOG_PATH
  );
  return releaseNotes;
}

/**
 * Increment the version in package.json and commit.
 */
async function bumpVersion(gulp, packageDir, newVersion, releaseNotes) {
  const PACKAGE_JSON_FILENAME = `src/${packageDir}/package.json`;
  const git = simpleGit();

  await toPromise(gulp.src(PACKAGE_JSON_FILENAME)
    .pipe(streamMap((file) => {
      const outFile = file.clone();
      const pkg = JSON.parse(file.contents.toString());
      pkg.version = newVersion;
      outFile.contents = new Buffer(JSON.stringify(sortPkg(pkg), null, 2));
      return outFile;
    }))
    .pipe(gulp.dest(PACKAGE_JSON_FILENAME))
  );

  const annotation = [
    `Bump ${packageDir} version to v${newVersion}`,
    ...releaseNotes.split('\n').slice(1),
  ].join('\n');

  await git.commit(annotation, PACKAGE_JSON_FILENAME);
}

/**
 * Push the release branch to the origin.
 */
async function pushReleaseBranch(branch) {
  const git = simpleGit();

  const remotes = (await git.getRemotes()).map((r) => r.name);

  if (!remotes.length) {
    log(colors.red.bold('No Git remotes set up'));
    log(`Please add a Git remote and push the "${branch}" branch manually.`);
    return;
  }


  const {shouldPush, remoteChoice} = await prompt([{
    type: 'confirm',
    name: 'shouldPush',
    default: false,
    message: `Push release branch "${branch}" to remote?`,
  }, {
    type: 'list',
    name: 'remoteChoice',
    when: () => remotes.length > 1,
    message: 'Which remote should the branch be pushed to?',
  }]);

  if (!shouldPush) return;

  const remote = remotes.length === 1 ? remotes[0] : remoteChoice;

  await git.push(remote, branch);
}

/**
 * Start a release.
 */
async function beginRelease(gulp) {
  const git = simpleGit();
  const isClean = (await git.status()).isClean();
  if (!isClean) {
    log(colors.red('Working directory is not clean!'));
    log('Please commit or stash files before cutting a release.');
    return;
  }

  const branchStatus = await git.branch();
  if (branchStatus.current !== 'develop') {
    log(colors.red('`develop` branch is not checked out!'));
    log('Please check out the `develop` branch to proceed.');
    return;
  }
  await git.fetch();

  const {
    releasedPackage, newVersion,
  } = await releaseBeginPrompt(gulp);
  const BRANCH_NAME = `release/${releasedPackage.dir}/v${newVersion}`;
  await git.checkoutLocalBranch(BRANCH_NAME);
  log(`Checked out new branch "${BRANCH_NAME}"`);

  const releaseNotes = await createChangelog(
    gulp, releasedPackage.dir, newVersion);
  await bumpVersion(gulp, releasedPackage.dir, newVersion, releaseNotes);

  await pushReleaseBranch(BRANCH_NAME);
}

/**
 * Add and push the Git tag for this version.
 *
 * TODO: figure out how to attach the release notes as an annotation.
 */
async function tagReleaseVersion(nil) {
  if (!nil) throw new Error('TODO');
}

/**
 * Publish the package to npm.
 */
async function publishToNpm(nil) {
  if (!nil) throw new Error('TODO');
}

/**
 * Update the version and PR back into `develop`.
 */
async function propagateVersionBump(nil) {
  if (!nil) throw new Error('TODO');
}

/**
 * Finish a release by:
 * - tagging the commit,
 * - pushing the tag to the remote,
 * - publishing to npm, and
 * - merging the version bump back into `develop`.
 *
 * This is meant to run in CI when the `master` branch builds after a merge.
 */
async function completeRelease(gulp) {
  await tagReleaseVersion();
  await publishToNpm();
  await propagateVersionBump();
}

/**
 * Register release tasks to the given gulp instance.
 */
export default function registerReleaseTasks(gulpInstance) {
  gulpInstance.task('release.begin', () => beginRelease(gulpInstance));
  gulpInstance.task('release.complete', () => completeRelease(gulpInstance));
}
