import ENV from '../config/environment';
import pretenderConfig from '../ember-pretenderify/config';
import loadData from 'ember-pretenderify/load-data';

export default {
  name: 'ember-pretenderify',
  initialize: function(container, application) {
    var config = ENV['ember-pretenderify'];

    if (config.setupPretender || config.force) {
      var server = new Pretender(function() {
        pretenderConfig.defaults.call(this);
        loadData(ENV.modulePrefix, this.store);
        pretenderConfig.userConfig.call(this);
      });
    }
  }
};
