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
    var shouldUseServer = config.force || (!config.usingProxy ? config.isEnabledEnvironment : true);
    if (shouldUseServer) {
      var factoryMap = readFactories(ENV.modulePrefix);
      var fixtures = readFixtures(ENV.modulePrefix);
      var server = new Server({
        environment: env
      });

      server.loadConfig(userConfig);

      if (env === 'test' && factoryMap) {
        server.loadFactories(factoryMap);

      } else {
        server.db.loadData(fixtures);
      }
    }
  }
};
