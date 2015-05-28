import ENV from '../config/environment';
import baseConfig, { testConfig } from '../mirage/config';
import Server from 'ember-cli-mirage/server';
import readFixtures from 'ember-cli-mirage/utils/read-fixtures';
import readFactories from 'ember-cli-mirage/utils/read-factories';

export default {
  name: 'ember-cli-mirage',
  initialize: function(container, application) {
    var env = ENV.environment;

    if (_shouldUseMirage(env, ENV['ember-cli-mirage'])) {
      var factoryMap = readFactories(ENV.modulePrefix);
      var fixtures = readFixtures(ENV.modulePrefix);
      var server = new Server({
        environment: env
      });

      server.loadConfig(baseConfig);

      if (env === 'test') {
        server.loadConfig(testConfig);
      }

      if (env === 'test' && factoryMap) {
        server.loadFactories(factoryMap);

      } else {
        server.db.loadData(fixtures);
      }
    }
  }
};

function _shouldUseMirage(env, addonConfig) {
  var userDeclaredEnabled = typeof addonConfig.enabled !== 'undefined';
  var defaultEnabled = _defaultEnabled(env, addonConfig);

  return userDeclaredEnabled ? addonConfig.enabled : defaultEnabled;
}

/*
  Returns a boolean specifying the default behavior for whether
  to initialize Mirage.
*/
function _defaultEnabled(env, addonConfig) {
  var usingInDev = env === 'development' && !addonConfig.usingProxy;
  var usingInTest = env === 'test';

  return usingInDev || usingInTest;
}
