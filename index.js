'use strict';
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');
var unwatchedTree = require('broccoli-unwatched-tree');

module.exports = {
  name: 'ember-cli-mirage',

  included: function included(app) {
    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['ember-cli-mirage'] || {};
    this.addonBuildConfig = this.app.options['ember-cli-mirage'] || {};
    this.mirageDirectory = this.addonBuildConfig['directory'] || path.join(this.app.project.root, '/mirage');

    this.miragePath = this.addonConfig['miragePath'] || path.join(this.app.project.root, '/mirage');

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

    return enabledInProd || (this.app.env !== 'production');
  }
};
