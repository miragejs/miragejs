/* eslint-env node */
'use strict';

const AddonDocsConfig = require('ember-cli-addon-docs/lib/config');

module.exports = class extends AddonDocsConfig {
  /*
    Return a boolean indicating whether or not the current deploy should
    actually run. The `info` parameter contains details about the most recent
    git commit. Note that you can also access any configured environment
    variables via `process.ENV`.

    info.branch         => the current branch or `null` if not on a branch
    info.sha            => the current sha
    info.abbreviatedSha => the first 10 chars of the current sha
    info.tag            => the tag for the current sha or `null` if none exists
    info.committer      => the committer for the current sha
    info.committerDate  => the commit date for the current sha
    info.author         => the author for the current sha
    info.authorDate     => the authored date for the current sha
    info.commitMessage  => the commit message for the current sha

    Note that CI providers typically check out a specific commit hash rather
    than a named branch, so `info.branch` may not be available in CI builds.
  */
  shouldDeploy(info) {
    /*
      For example, you might configure your CI builds to execute `ember deploy`
      at the end of each successful run, but you may only want to actually
      deploy builds on the `master` branch with the default ember-try scenario.
      To accomplish that on Travis, you could write:

      return process.env.TRAVIS_BRANCH === 'master'
          && process.env.EMBER_TRY_SCENARIO == 'ember-default';
    */
    return super.shouldDeploy(info);
  }

  /*
    Return a string indicating a subdirectory in the gh-pages branch you want
    to deploy to, or nothing to deploy to the root. This hook receives the same
    info object as `shouldDeploy` above.
  */
  deployDirectory(info) {
    /*
      For example, to deploy a permalink-able copy of your docs site any time
      you tag a release, you could write:

      return info.tag ? `tags/${info.tag}` : 'master';
    */
    return super.deployDirectory(info);
  }

  /*
    By default, the folder returned by `deployDirectory()` above will be
    emptied out before a new revision of the docs application is written there.

    To retain certain files across deploys, return an array of file paths or
    globs, relative to the deploy directory, indicating files/directories that
    should not be removed before deploying.
  */
  preservedPaths(info) {
    /*
      For example, if you had static JSON in your gh-pages branch powering
      something like a blog UI that you want to manage separately from your
      app deploys, you might write:

      return ['blog-posts/*.json', ...super.preservedPaths(info)];
    */
    return super.preservedPaths(info);
  }
};
