import ENV from '../config/environment';
import baseConfig, { testConfig } from '../mirage/config';
import Server from 'ember-cli-mirage/server';
import readModules from 'ember-cli-mirage/utils/read-modules';

function hasModulesOfType(modulesMap, type) {
  var modulesOfType = modulesMap[type] || {};

  return _.keys(modulesOfType).length > 0;
}

export default {
  name: 'ember-cli-mirage',
  initialize: function(container, application) {
    var env = ENV.environment;

    if (_shouldUseMirage(env, ENV['ember-cli-mirage'])) {
      var modulesMap = readModules(ENV.modulePrefix);
      var hasFactories = hasModulesOfType(modulesMap, 'factories');
      var hasDefaultScenario = modulesMap['scenarios'].hasOwnProperty('default');
      var hasModels = hasModulesOfType(modulesMap, 'models');
      var hasSerializers = hasModulesOfType(modulesMap, 'serializers');

      var server = new Server({
        environment: env,
        modelsMap: hasModels ? modulesMap['models'] : null,
        serializersMap: hasSerializers ? modulesMap['serializers'] : null
      });

      server.loadConfig(baseConfig);

      if (env === 'test' && testConfig) {
        server.loadConfig(testConfig);
      }

      if (env === 'test' && hasFactories) {
        server.loadFactories(modulesMap['factories']);
      } else if (env !== 'test' && hasDefaultScenario && hasFactories) {
        server.loadFactories(modulesMap['factories']);
        modulesMap['scenarios']['default'](server);
      } else {
        server.db.loadData(modulesMap['fixtures']);
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
