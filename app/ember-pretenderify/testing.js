import Pretender from 'pretender';
import pretenderConfig from './config';

export default {
  setup: function(application) {
    application.pretender = new Pretender(function() {
      pretenderConfig.defaults.call(this);
      pretenderConfig.userConfig.call(this);
    });

    window.serverData = application.pretender.data;
  }
}
