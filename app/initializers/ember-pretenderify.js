import ENV from '../config/environment';
import userConfig from '../pretender/config';
import Server from 'ember-pretenderify/server';

export default {
  name: 'ember-pretenderify',
  initialize: function(container, application) {
    var config = ENV['ember-pretenderify'];
    var env = ENV.environment;
    var shouldUsePretender = config.force || !config.usingProxy;
    var usingInDev = env === 'development' && shouldUsePretender;
    var usingInTest = env === 'test';

    if (usingInDev || usingInTest) {
      new Server({
        environment: env,
        modulePrefix: ENV.modulePrefix,
        userConfig: userConfig
      });
    }
  }
};
