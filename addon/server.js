import Pretender from 'pretender';
import defaults from './defaults';
import loadData from './load-data';
import store from 'ember-pretenderify/store';

export default function(options) {

  this.server = new Pretender(function() {

    // Default Pretender config
    this.timing = 400;

    this.prepareBody = function(body) {
      return body ? JSON.stringify(body) : '{"error": "not found"}';
    };

    this.unhandledRequest = function(verb, path) {
      console.error("Your Ember app tried to " + verb + " '" + path + "', but there was no Pretender route defined to handle this request.");
    };

    defaults.call(this, options.environment);

    // Add user config, which adds routes + overrides defaults
    options.userConfig.call(this);
  });

  this.server.store = store;

  if (options.environment !== 'test') {
    loadData(options.modulePrefix, this.server.store);
  }

  if (options.environment === 'test') {
    window.store = this.server.store;
  }

  return this.server;
}
