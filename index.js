/* jshint node: true */
'use strict';
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');
var unwatchedTree = require('broccoli-unwatched-tree');

module.exports = {
  name: 'ember-cli-mirage',

  included: function included(app) {
    this._super.included.apply(this, arguments);

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['ember-cli-mirage'] || {};
    this.addonBuildConfig = this.app.options['ember-cli-mirage'] || {};
    if (this.addonBuildConfig['directory']) {
      this.mirageDirectory = this.addonBuildConfig['directory'];
    } else if (app.project.pkg['ember-addon'] && !app.project.pkg['ember-addon'].paths) {
      this.mirageDirectory = path.resolve(app.project.root, path.join('tests', 'dummy', 'mirage'))
    } else {
      this.mirageDirectory = path.join(this.app.project.root, '/mirage');
    }

    if (this._shouldIncludeFiles()) {
      app.import(app.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js');
      app.import(app.bowerDirectory + '/route-recognizer/dist/route-recognizer.js');
      app.import(app.bowerDirectory + '/pretender/pretender.js');
      app.import('vendor/ember-cli-mirage/pretender-shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
      app.import(app.bowerDirectory + '/Faker/build/build/faker.js');
    }
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  treeFor: function(name) {
    if (!this._shouldIncludeFiles()) {
      return;
    }

    return this._super.treeFor.apply(this, arguments);
  },

  treeForApp: function(name) {
    var originalAppTree = unwatchedTree(path.resolve(__dirname, 'app'));
    var mirageFilesTree = new Funnel(this.mirageDirectory, {
      destDir: 'mirage'
    });

    return mergeTrees([originalAppTree, mirageFilesTree]);
  },

  _shouldIncludeFiles: function() {
    var enabledInProd = this.app.env === 'production' && this.addonConfig.enabled;
    var explicitExcludeFiles = this.addonConfig.excludeFilesFromBuild;
    if (enabledInProd && explicitExcludeFiles) {
      throw new Error('Mirage was explicitly enabled in production, but its files were excluded ' +
                      'from the build. Please, use only ENV[\'ember-cli-mirage\'].enabled in ' +
                      'production environment.');
    }
    return enabledInProd || (this.app.env !== 'production' && explicitExcludeFiles !== true);
  }
};
