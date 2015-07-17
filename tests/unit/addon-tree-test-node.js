 /*jshint -W079 */
/* jshint node: true */
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

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
  this.timeout(15000);

  afterEach(function() {
    delete process.env.EMBER_ENV;
  });

  describe('#treeFor', function() {
    it('returns an empty tree in production environment by default', function() {
      process.env.EMBER_ENV = 'production';
      var addonTree = getMirageAddon().treeFor('addon');

      expect(addonTree.inputTrees.length).to.be.equal(0);
    });

    ['development', 'test'].forEach(function(environment) {
      it('returns a tree in ' + environment + ' environment by default', function() {
        process.env.EMBER_ENV = environment;
        var addonTree = getMirageAddon().treeFor('addon');

        expect(addonTree.inputTrees.length).to.not.equal(0);
      });
    });

    it('returns a tree in production environment when enabled is specified', function() {
      process.env.EMBER_ENV = 'production';
      var addon = getMirageAddon({ configPath: 'tests/fixtures/config/environment-production-enabled' });
      var addonTree = addon.treeFor('addon');

      expect(addonTree.inputTrees.length).to.not.equal(0);
    });

  });


  describe('#postprocessTree', function() {

    it('excludes app/mirage tree in production environment', function() {
      process.env.EMBER_ENV = 'production';
      var excludePretenderDirCalled = false;
      var dummyApp = new EmberAddon();
      var addon = findMirage(dummyApp);
      addon._excludePretenderDir = function(tree) {
        excludePretenderDirCalled = true;
        return tree;
      };
      dummyApp.toTree();

      expect(excludePretenderDirCalled).to.be.equal(true);
    });

    ['development', 'test'].forEach(function(environment) {
      it('includes app/mirage tree in ' + environment + ' environment', function() {
        process.env.EMBER_ENV = environment;
        var excludePretenderDirCalled = false;
        var dummyApp = new EmberAddon();
        var addon = findMirage(dummyApp);
        addon._excludePretenderDir = function(tree) {
          excludePretenderDirCalled = true;
          return tree;
        };
        dummyApp.toTree();

        expect(excludePretenderDirCalled).to.be.equal(false);
      });
    });

    it('includes app/mirage tree in production environment when enabled is set to true', function() {
      process.env.EMBER_ENV = 'production';
      var excludePretenderDirCalled = false;
      var dummyApp = new EmberAddon({ configPath: 'tests/fixtures/config/environment-production-enabled' });
      var addon = findMirage(dummyApp);
      addon._excludePretenderDir = function(tree) {
        excludePretenderDirCalled = true;
        return tree;
      };
      dummyApp.toTree();

      expect(excludePretenderDirCalled).to.be.equal(false);
    });

  });
});
