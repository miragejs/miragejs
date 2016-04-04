 /*jshint -W079 */
/* jshint node: true */
/* jshint expr: true */
// jscs:disable
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var path = require('path');

function getMirageAddon(options) {
  options = options || {};
  options['ember-cli-mirage'] = options['ember-cli-mirage'] || {};
  options['ember-cli-mirage'].directory = options['ember-cli-mirage'].directory || path.resolve(__dirname, path.join('..', 'dummy', 'mirage'));

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

  var treeForTests = function(name) {
    it('returns an empty tree in production environment by default', function() {
      process.env.EMBER_ENV = 'production';
      var addonTree = getMirageAddon().treeFor(name);

      expect(addonTree).to.be.undefined;
    });

    ['development', 'test'].forEach(function(environment) {
      it('returns a tree in ' + environment + ' environment by default', function() {
        process.env.EMBER_ENV = environment;
        var addonTree = getMirageAddon().treeFor(name);

        expect(addonTree._inputNodes.length).to.not.equal(0);
      });
    });

    it('returns a tree in production environment when enabled is specified', function() {
      process.env.EMBER_ENV = 'production';
      var addon = getMirageAddon({ configPath: 'tests/fixtures/config/environment-production-enabled' });
      var addonTree = addon.treeFor(name);

      expect(addonTree._inputNodes.length).to.not.equal(0);
    });
  };

  describe('#treeFor addon', function() {
    treeForTests('addon');
  });

  describe('#treeFor app', function() {
    treeForTests('app');
  });

});
