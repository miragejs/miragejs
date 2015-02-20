 /*jshint -W079 */
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var path = require('path');

function getPretenderifyAddon(options) {
  var dummyApp = new EmberAddon(options);
  return findPretenderify(dummyApp);
}

function findPretenderify(app) {
  var addons = app.project.addons;
  for(var i = 0; i < addons.length; i++) {
    if(addons[i].name === 'ember-pretenderify') {
      return addons[i];
    }
  }
}

describe('Addon', function() {
  afterEach(function() {
    delete process.env.EMBER_ENV;
  });

  describe('#treeFor', function() {

    it('returns an empty tree in production environment', function() {
      process.env.EMBER_ENV = 'production';
      var addonTree = getPretenderifyAddon().treeFor('addon');

      expect(addonTree.inputTrees.length).to.be.equal(0);
    });

    ['development', 'test'].forEach(function(environment) {

      it('returns a tree in ' + environment + ' environment', function() {
        process.env.EMBER_ENV = environment;
        var addonTree = getPretenderifyAddon().treeFor('addon');

        expect(addonTree.inputTrees.length).to.be.equal(1);
      });

    });

    it('returns a tree regardless the environment when force option is true', function() {
      process.env.EMBER_ENV = 'production';
      var addon = getPretenderifyAddon({ configPath: 'tests/fixtures/config/environment-with-force-true' });
      var addonTree = addon.treeFor('addon');

      expect(addonTree.inputTrees.length).to.be.equal(1);
    });

  });

  describe('#postprocessTree', function() {

    it('excludes app/pretender tree in production environment', function() {
      this.timeout(10000);
      process.env.EMBER_ENV = 'production';
      var excludePretenderDirCalled = false;
      var dummyApp = new EmberAddon();
      var addon = findPretenderify(dummyApp);
      addon.excludePretenderDir = function(tree) {
        excludePretenderDirCalled = true;
        return tree;
      };
      dummyApp.toTree();

      expect(excludePretenderDirCalled).to.be.equal(true);
    });

    ['development', 'test'].forEach(function(environment) {

      it('includes app/pretender tree in ' + environment + ' environment', function() {
        this.timeout(10000);
        process.env.EMBER_ENV = environment;
        var excludePretenderDirCalled = false;
        var dummyApp = new EmberAddon();
        var addon = findPretenderify(dummyApp);
        addon.excludePretenderDir = function(tree) {
          excludePretenderDirCalled = true;
          return tree;
        };
        dummyApp.toTree();

        expect(excludePretenderDirCalled).to.be.equal(false);
      });

    });

    it('includes app/pretender tree regardless the environment when force option is true', function() {
      this.timeout(10000);
      process.env.EMBER_ENV = 'production';
      var excludePretenderDirCalled = false;
      var dummyApp = new EmberAddon({ configPath: 'tests/fixtures/config/environment-with-force-true' });
      var addon = findPretenderify(dummyApp);
      addon.excludePretenderDir = function(tree) {
        excludePretenderDirCalled = true;
        return tree;
      };
      dummyApp.toTree();

      expect(excludePretenderDirCalled).to.be.equal(false);
    });
  });
});
