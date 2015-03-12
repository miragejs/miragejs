import ENV from '../config/environment';
import userConfig from '../mirage/config';
import Server from 'ember-cli-mirage/server';
import readFixtures from 'ember-cli-mirage/utils/read-fixtures';
import readFactories from 'ember-cli-mirage/utils/read-factories';

export default {
  name: 'ember-cli-mirage',
  initialize: function(container, application) {
    var config = ENV['ember-cli-mirage'];
    var env = ENV.environment;
    var usingInDev = env === 'development' && !config.usingProxy;
    var usingInTest = env === 'test';
    var shouldUseServer = config.force || usingInDev || usingInTest;

    if (shouldUseServer) {
      var server = new Server({
        environment: env
      });

      server.loadConfig(userConfig);

      if (usingInDev || config.force) {
        var fixtures = readFixtures(ENV.modulePrefix);
        server.db.loadData(fixtures);

      } else if (usingInTest) {
        var factoryMap = readFactories(ENV.modulePrefix);
        server.loadFactories(factoryMap);
      }
    }
  }
};
