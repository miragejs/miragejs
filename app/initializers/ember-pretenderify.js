import ENV from '../config/environment';
import Pretender from 'pretender';
import userConfig from '../pretender/index';

var defaults = function() {
  this.prepareBody = function(body) {
    return body ? JSON.stringify(body) : '{"error": "not found"}';
  };

  this.unhandledRequest = function(verb, path) {
    console.error(`Your Ember app tried to ${verb} '${path}', but there was no Pretender route defined to handle this request.`);
  };

  this.stub = function(verb, path, handler) {
    this[verb].call(this, 'blah', function(request) {
      console.log('Hitting ' + path);

      if (typeof handler === 'function') {
        var handlerResponse = handler(request);
        var responseData = handlerResponse.data;
        var responseCode = handlerResponse.code || 200;

      } else {
        var responseData = handler;
        var responseCode = 200;
      }

      return [responseCode, {"Content-Type": "application/json"}, responseData];
    })
  }.bind(this);
};

export default {
  name: 'ember-pretenderify',
  initialize: function(container, application) {
    if (ENV['ember-pretenderify'].usePretender) {
      new Pretender(function() {
        defaults.call(this);
        userConfig.call(this);
      });
    }
  }
};
