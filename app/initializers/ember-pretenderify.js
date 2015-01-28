import ENV from '../config/environment';
import pretenderConfig from '../ember-pretenderify/config';

export default {
  name: 'ember-pretenderify',
  initialize: function(container, application) {
    if (ENV['ember-pretenderify'].setupPretender) {
      var server = new Pretender(function() {
        pretenderConfig.defaults.call(this);
        pretenderConfig.setupData.call(this);
        pretenderConfig.userConfig.call(this);
      });
    }
  }
};
