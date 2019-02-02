'use strict';
const path = require('path');
const mergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');
const map = require('broccoli-stew').map;
const writeFile = require('broccoli-file-creator');

module.exports = {
  name: 'ember-cli-mirage',

  options: {
    nodeAssets: {
      '@xg-wang/whatwg-fetch': npmAsset({
        import: ['dist/fetch.umd.js']
      }),
      'route-recognizer': npmAsset({
        srcDir: 'dist',
        import: ['route-recognizer.js'],
        vendor: ['route-recognizer.js.map']
      }),
      'fake-xml-http-request': npmAsset({
        import: ['fake_xml_http_request.js']
      }),
      'faker': npmAsset({
        import: ['build/build/faker.js']
      })
    }
  },

  included() {
    let app;

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    } else {
      // Otherwise, we'll use this implementation borrowed from the _findHost()
      // method in ember-cli.
      let current = this;
      do {
        app = current.app || app;
      } while (current.parent.parent && (current = current.parent));
    }

    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['ember-cli-mirage'] || {};
    this.addonBuildConfig = this.app.options['ember-cli-mirage'] || {};

    // Call super after initializing config so we can use _shouldIncludeFiles for the node assets
    this._super.included.apply(this, arguments);

    if (this.addonBuildConfig.directory) {
      this.mirageDirectory = this.addonBuildConfig.directory;
    } else if (this.addonConfig.directory) {
      this.mirageDirectory = this.addonConfig.directory;
    } else if (app.project.pkg['ember-addon'] && app.project.pkg['ember-addon'].configPath) {
      this.mirageDirectory = path.resolve(app.project.root, path.join('tests', 'dummy', 'mirage'));
    } else {
      this.mirageDirectory = path.join(this.app.project.root, '/mirage');
    }
  },

  blueprintsPath() {
    return path.join(__dirname, 'blueprints');
  },

  treeFor(name) {
    let tree;
    let shouldIncludeFiles = this._shouldIncludeFiles();

    if (!shouldIncludeFiles && name === 'app') {
      // Include a noop initializer, even if Mirage is excluded from the build
      tree = writeFile('initializers/ember-cli-mirage.js', `
        export default {
          name: 'ember-cli-mirage',
          initialize() {}
        };
      `);
    } else if (shouldIncludeFiles) {
      tree = this._super.treeFor.apply(this, arguments);
    }

    return tree;
  },

  _lintMirageTree(mirageTree) {
    let lintedMirageTrees;
    // _eachProjectAddonInvoke was added in ember-cli@2.5.0
    // this conditional can be removed when we no longer support
    // versions older than 2.5.0
    if (this._eachProjectAddonInvoke) {
      lintedMirageTrees = this._eachProjectAddonInvoke('lintTree', ['mirage', mirageTree]);
    } else {
      lintedMirageTrees = this.project.addons.map(function(addon) {
        if (addon.lintTree) {
          return addon.lintTree('mirage', mirageTree);
        }
      }).filter(Boolean);
    }

    let lintedMirage = mergeTrees(lintedMirageTrees, {
      overwrite: true,
      annotation: 'TreeMerger (mirage-lint)'
    });

    return new Funnel(lintedMirage, {
      destDir: 'tests/mirage/'
    });
  },

  treeForApp(appTree) {
    let trees = [ appTree ];
    let mirageFilesTree = new Funnel(this.mirageDirectory, {
      destDir: 'mirage'
    });
    trees.push(mirageFilesTree);

    if (this.hintingEnabled()) {
      trees.push(this._lintMirageTree(mirageFilesTree));
    }

    return mergeTrees(trees);
  },

  _shouldIncludeFiles() {
    if (process.env.EMBER_CLI_FASTBOOT) {
      return false;
    }

    let environment = this.app.env;
    let enabledInProd = environment === 'production' && this.addonConfig.enabled;
    let explicitExcludeFiles = this.addonConfig.excludeFilesFromBuild;
    if (enabledInProd && explicitExcludeFiles) {
      throw new Error('Mirage was explicitly enabled in production, but its files were excluded '
                      + 'from the build. Please, use only ENV[\'ember-cli-mirage\'].enabled in '
                      + 'production environment.');
    }
    return enabledInProd || (environment && environment !== 'production' && explicitExcludeFiles !== true);
  }
};

function npmAsset(options = {}) {
  let defaultOptions = {
    // guard against usage in FastBoot 1.0, where process.env.EMBER_CLI_FASTBOOT is not available
    _processTree(input) {
      return map(input, content => `if (typeof FastBoot !== 'undefined') { ${content} }`);
    }
  };

  let assetOptions = Object.assign(defaultOptions, options);

  return function() {
    let finalOptions = Object.assign(
      assetOptions,
      {
        enabled: this._shouldIncludeFiles()
      }
    );

    return finalOptions;
  };
}
