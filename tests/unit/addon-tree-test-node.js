 /*jshint -W079 */
/* jshint node: true */
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var path = require('path');

function getMirageAddon(options) {
  var dummyApp = new EmberAddon(options);
  return findMirage(dummyApp);
}

function findMirage(app) {
  var addons = app.project.addons;
  for(var i = 0; i < addons.length; i++) {
    if(addons[i].name === 'ember-cli-mirage') {
      return addons[i];
    }
  }
}

describe('Addon', function() {
  afterEach(function() {
    delete process.env.EMBER_ENV;
  });

  describe('#treeFor', function() {
    var addonTree;

    it('returns an empty tree in production environment by default', function() {
      process.env.EMBER_ENV = 'production';
      var addonTree = getMirageAddon().treeFor('addon');

      expect(addonTree.inputTrees.length).to.be.equal(0);
    });

    ['development', 'test'].forEach(function(environment) {
      it('returns a tree in ' + environment + ' environment by default', function() {
        process.env.EMBER_ENV = environment;
        var addonTree = getMirageAddon().treeFor('addon');

        expect(addonTree.inputTrees.length).to.be.equal(1);
      });
    });

    it('returns a tree in production environment when enabled is specified', function() {
      process.env.EMBER_ENV = 'production';
      var addon = getMirageAddon({ configPath: 'tests/fixtures/config/environment-production-enabled' });
      var addonTree = addon.treeFor('addon');

      expect(addonTree.inputTrees.length).to.be.equal(1);
    });

    ['development', 'test'].forEach(function(environment) {
      it('returns an empty tree in ' + environment + ' environment when enabled is set to false', function() {
        process.env.EMBER_ENV = environment;
        var addon = getMirageAddon({ configPath: 'tests/fixtures/config/environment-' + environment + '-disabled' });
        var addonTree = addon.treeFor('addon');

        expect(addonTree.inputTrees.length).to.be.equal(0);
      });
    });

  });


  describe('#postprocessTree', function() {

    it('excludes app/mirage tree in production environment', function() {
      this.timeout(10000);
      process.env.EMBER_ENV = 'production';
      var excludePretenderDirCalled = false;
      var dummyApp = new EmberAddon();
      var addon = findMirage(dummyApp);
      addon.excludePretenderDir = function(tree) {
        excludePretenderDirCalled = true;
        return tree;
      };
      dummyApp.toTree();

      expect(excludePretenderDirCalled).to.be.equal(true);
    });

    ['development', 'test'].forEach(function(environment) {
      it('includes app/mirage tree in ' + environment + ' environment', function() {
        this.timeout(10000);
        process.env.EMBER_ENV = environment;
        var excludePretenderDirCalled = false;
        var dummyApp = new EmberAddon();
        var addon = findMirage(dummyApp);
        addon.excludePretenderDir = function(tree) {
          excludePretenderDirCalled = true;
          return tree;
        };
        dummyApp.toTree();

        expect(excludePretenderDirCalled).to.be.equal(false);
      });
    });

    it('includes app/mirage tree in production environment when enabled is set to true', function() {
      this.timeout(10000);
      process.env.EMBER_ENV = 'production';
      var excludePretenderDirCalled = false;
      var dummyApp = new EmberAddon({ configPath: 'tests/fixtures/config/environment-production-enabled' });
      var addon = findMirage(dummyApp);
      addon.excludePretenderDir = function(tree) {
        excludePretenderDirCalled = true;
        return tree;
      };
      dummyApp.toTree();

      expect(excludePretenderDirCalled).to.be.equal(false);
    });

    ['development', 'test'].forEach(function(environment) {
      it('excludes app/mirage tree in ' + environment + ' environment when enabled is set to false', function() {
        this.timeout(10000);
        process.env.EMBER_ENV = environment;
        var excludePretenderDirCalled = false;
        var dummyApp = new EmberAddon({ configPath: 'tests/fixtures/config/environment-' + environment + '-disabled' });
        var addon = findMirage(dummyApp);
        addon.excludePretenderDir = function(tree) {
          excludePretenderDirCalled = true;
          return tree;
        };
        dummyApp.toTree();

        expect(excludePretenderDirCalled).to.be.equal(true);
      });
    });

  });
});
