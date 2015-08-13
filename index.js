'use strict';
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-cli-mirage',

  included: function included(app) {
    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['ember-cli-mirage'];

    if (this._shouldIncludeFiles()) {
      app.import(app.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js');
      app.import(app.bowerDirectory + '/route-recognizer/dist/route-recognizer.js');
      app.import(app.bowerDirectory + '/pretender/pretender.js');
      app.import('vendor/ember-cli-mirage/pretender-shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
      app.import(app.bowerDirectory + '/lodash/lodash.js');
      app.import(app.bowerDirectory + '/Faker/build/build/faker.js');
    }
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  treeFor: function(name) {
    if (this._shouldIncludeFiles()) {
      return this._super.treeFor.apply(this, arguments);
    }
    this._requireBuildPackages();
    return mergeTrees([]);
  },

  postprocessTree: function(type, tree) {
    if(type === 'js' && !this._shouldIncludeFiles()) {
      return this._excludePretenderDir(tree);
    }
    return tree;
  },

  _shouldIncludeFiles: function() {
    var enabledInProd = this.app.env === 'production' && this.addonConfig.enabled;

    return enabledInProd || (this.app.env !== 'production');
  },

  _excludePretenderDir: function(tree) {
    var modulePrefix = this.app.project.config(this.app.env)['modulePrefix'];
    return new Funnel(tree, {
      exclude: [new RegExp('^' + modulePrefix + '/mirage/')],
      description: 'Funnel: exclude mirage'
    });
  }

};
