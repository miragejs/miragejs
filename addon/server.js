import Pretender from 'pretender';
import defaults from './defaults';
import loadData from './load-data';

export default function(options) {

  var server = new Pretender(function() {
    defaults.call(this, options.environment);
    options.userConfig.call(this);
  });

  if (options.environment !== 'test') {
    loadData(options.modulePrefix, server.store);
  }

  if (options.environment === 'test') {
    window.store = server.store;
  }

  return server;
}
