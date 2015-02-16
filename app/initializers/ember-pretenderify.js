import ENV from '../config/environment';
import userConfig from '../pretender/config';
import Server from 'ember-pretenderify/server';
import readData from 'ember-pretenderify/utils/read-data';

export default {
  name: 'ember-pretenderify',
  initialize: function(container, application) {
    var config = ENV['ember-pretenderify'];
    var env = ENV.environment;
    var shouldUsePretender = config.force || !config.usingProxy;
    var usingInDev = env === 'development' && shouldUsePretender;
    var usingInTest = env === 'test';
    var shouldUseServer = usingInDev || usingInTest;

    if (shouldUseServer) {
      var server = new Server({
        environment: env
      });

      server.loadConfig(userConfig);

      if (usingInDev) {
        var userData = readData(ENV.modulePrefix);
        server.loadData(userData);
      }
    }
  }
};
