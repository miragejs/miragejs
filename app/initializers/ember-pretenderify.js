import ENV from '../config/environment';
import userConfig from '../pretender/config';
import Server from 'ember-pretenderify/server';
import readData from 'ember-pretenderify/utils/read-data';
import readFactories from 'ember-pretenderify/utils/read-factories';

export default {
  name: 'ember-pretenderify',
  initialize: function(container, application) {
    var config = ENV['ember-pretenderify'];
    var env = ENV.environment;
    var usingInDev = env === 'development' && !config.usingProxy;
    var usingInTest = env === 'test';
    var shouldUseServer = usingInDev || usingInTest || config.force;

    if (shouldUseServer) {
      var server = new Server({
        environment: env
      });

      server.loadConfig(userConfig);

      if (usingInDev || config.force) {
        var userData = readData(ENV.modulePrefix);
        server.loadData(userData);

      } else if (usingInTest) {

        var factoryMap = readFactories(ENV.modulePrefix);
        server.loadFactories(factoryMap);
      }
    }
  }
};
