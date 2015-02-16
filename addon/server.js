import Pretender from 'pretender';
import loadData from './load-data';
import store from './store';
import frontController from './controllers/front';

export default function(options) {
  // Init vars
  var environment = options.environment;
  var userConfig = options.userConfig;
  var modulePrefix = options.modulePrefix;

  // Default properties
  this.timing = 400;
  this.namespace = '';

  // Methods
  this.store = store;

  this.interceptor = new Pretender(function() {
    // Default Pretender config
    this.prepareBody = function(body) {
      return body ? JSON.stringify(body) : '{"error": "not found"}';
    };

    this.unhandledRequest = function(verb, path) {
      console.error("Your Ember app tried to " + verb + " '" + path + "', but there was no Pretender route defined to handle this request.");
    };
  });

  this.stub = function(verb, path, handler, code) {
    var _this = this;
    var interceptor = this.interceptor;
    var timing = environment === 'test' ? 0 : this.timing;
    path = path[0] === '/' ? path.slice(1) : path;

    interceptor[verb].call(interceptor, this.namespace + '/' + path, function(request) {

      var response = frontController.handle(verb, handler, _this.store, request, code);

      if (environment !== 'test') {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, timing);
  };

  // Init
  // Add user config, which adds routes + overrides defaults
  userConfig.call(this);

  if (environment !== 'test') {
    loadData(modulePrefix, this.store);
  }

  if (environment === 'test') {
    window.store = this.store;
  }

  return this;
}
