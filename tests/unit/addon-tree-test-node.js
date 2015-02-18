 /*jshint -W079 */
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var path = require('path');

describe('treeFor', function() {
  afterEach(function() {
    delete process.env.EMBER_ENV;
  });

  function getPretenderifyAddon(options) {
    var addon = new EmberAddon(options);
    var addons = addon.project.addons;
    for(var i = 0; i < addons.length; i++) {
      if(addons[i].name === 'ember-pretenderify') {
        return addons[i];
      }
    }
  }

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
