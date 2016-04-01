 /*jshint -W079 */
/* jshint node: true */
// jscs:disable
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var _ = require('lodash');

describe('import files', function() {
  this.timeout(15000);

  afterEach(function() {
    delete process.env.EMBER_ENV;
  });

  it('doesn\'t include third party libraries in production environment by default', function() {
    process.env.EMBER_ENV = 'production';
    var addon = new EmberAddon();

    expect(_.values(addon._scriptOutputFiles)[0]).to.not.include.members([
      addon.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js',
      addon.bowerDirectory + '/route-recognizer/dist/route-recognizer.js',
      addon.bowerDirectory + '/pretender/pretender.js',
      'vendor/ember-cli-mirage/pretender-shim.js'
    ]);
  });

  ['development', 'test'].forEach(function(environment) {
    it('includes third party libraries in ' + environment + ' environment by default', function() {
      process.env.EMBER_ENV = environment;
      var addon = new EmberAddon();

      expect(_.values(addon._scriptOutputFiles)[0]).to.include.members([
        addon.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js',
        addon.bowerDirectory + '/route-recognizer/dist/route-recognizer.js',
        addon.bowerDirectory + '/pretender/pretender.js',
        'vendor/ember-cli-mirage/pretender-shim.js'
      ]);
    });
  });

  it('includes third party libraries in production when enabled is set to true', function() {
    process.env.EMBER_ENV = 'production';
    var addon = new EmberAddon({ configPath: 'tests/fixtures/config/environment-production-enabled' });

    expect(_.values(addon._scriptOutputFiles)[0]).to.include.members([
      addon.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js',
      addon.bowerDirectory + '/route-recognizer/dist/route-recognizer.js',
      addon.bowerDirectory + '/pretender/pretender.js',
      'vendor/ember-cli-mirage/pretender-shim.js'
    ]);
  });

});
