import userConfig from '../pretender/config';
import store from 'ember-pretenderify/store';
import frontController from 'ember-pretenderify/controllers/front';
import ENV from '../config/environment';

var defaults = function() {
  var _this = this;

  this.data = this.data || {};
  this.timing = 400;

  this.store = store;
  this.store.loadData(this.data);

  this.frontController = frontController;

  this.prepareBody = function(body) {
    return body ? JSON.stringify(body) : '{"error": "not found"}';
  };

  this.unhandledRequest = function(verb, path) {
    console.error("Your Ember app tried to " + verb + " '" + path + "', but there was no Pretender route defined to handle this request.");
  };

  this.getDefaultCode = function(verb) {
    var code = 200;
    switch (verb) {
      case 'put':
        code = 204;
        break;
      case 'post':
        code = 201;
        break;
      case 'delete':
        code = 204;
        break;
      default:
        code = 200;
        break;
    }

    return code;
  };

  this.stub = function(verb, path, handler, code) {
    var store = _this.store;
    var timing = ENV.environment === 'test' ? 0 : _this.timing;
    var namespace = _this.namespace || '';
    var code = code ? code : _this.getDefaultCode(verb);
    path = path[0] === '/' ? path.slice(1) : path;

    _this[verb].call(_this, namespace + '/' + path, function(request) {

      var response = _this.frontController.handle(verb, handler, store, request, code);

      if (ENV.environment !== 'test') {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, timing);

  };
};

export default {
  defaults: defaults,
  userConfig: userConfig
};
