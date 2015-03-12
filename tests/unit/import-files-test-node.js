 /*jshint -W079 */
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

describe('import files', function() {
  afterEach(function() {
    delete process.env.EMBER_ENV;
  });

  ['development', 'test'].forEach(function(environment) {

    it('includes third party libraries in ' + environment + ' environment', function() {
      process.env.EMBER_ENV = environment;
      var addon = new EmberAddon();

      expect(addon.legacyFilesToAppend).to.include.members([
        addon.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js',
        addon.bowerDirectory + '/route-recognizer/dist/route-recognizer.js',
        addon.bowerDirectory + '/pretender/pretender.js',
        'vendor/ember-cli-mirage/shim.js',
        addon.bowerDirectory + '/ember-inflector/ember-inflector.js'
      ]);
    });

  });

  it('doesn\'t include third party libraries in production environment', function() {
    process.env.EMBER_ENV = 'production';
    var addon = new EmberAddon();

    expect(addon.legacyFilesToAppend).to.not.include.members([
      addon.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js',
      addon.bowerDirectory + '/route-recognizer/dist/route-recognizer.js',
      addon.bowerDirectory + '/pretender/pretender.js',
      'vendor/ember-cli-mirage/shim.js',
      addon.bowerDirectory + '/ember-inflector/ember-inflector.js'
    ]);
  });

  it('includes third party libraries regardless the environment when force option is true', function() {
    process.env.EMBER_ENV = 'production';
    var addon = new EmberAddon({ configPath: 'tests/fixtures/config/environment-with-force-true' });

    expect(addon.legacyFilesToAppend).to.include.members([
      addon.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js',
      addon.bowerDirectory + '/route-recognizer/dist/route-recognizer.js',
      addon.bowerDirectory + '/pretender/pretender.js',
      'vendor/ember-cli-mirage/shim.js',
      addon.bowerDirectory + '/ember-inflector/ember-inflector.js'
    ]);
  });

});
