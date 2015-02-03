import Pretender from 'pretender';
import userConfig from '../pretender/config';
import userData from '../pretender/data/index';
import store from 'ember-pretenderify/store';
import frontController from 'ember-pretenderify/controllers/front';
import ENV from '../config/environment';

var setupData = function() {
  this.originalData = userData;

  this.store.loadData(userData);
}

var defaults = function() {
  var _this = this;

  this.data = this.data || {};
  this.timing = 400;

  this.store = store;
  this.store.loadData(this.data || {});

  this.frontController = frontController;

  this.prepareBody = function(body) {
    return body ? JSON.stringify(body) : '{"error": "not found"}';
  };

  this.unhandledRequest = function(verb, path) {
    console.error("Your Ember app tried to " + verb + " '" + path + "', but there was no Pretender route defined to handle this request.");
  };

  this.stub = function(verb, path, handler, code) {
    var store = this.store;
    var _this = this;
    var timing = ENV.environment === 'test' ? 0 : this.timing;
    var namespace = this.namespace || '';
    path = path[0] === '/' ? path.slice(1) : path;

    this[verb].call(this, namespace + '/' + path, function(request) {
      console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);

      return _this.frontController.handle(verb, handler, store, request, code);
    }, timing);

  }.bind(this);
};

export default {
  setupData: setupData,
  defaults: defaults,
  userConfig: userConfig
};
