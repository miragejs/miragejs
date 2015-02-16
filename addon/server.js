import Pretender from 'pretender';
import store from './store';
import frontController from './controllers/front';

/*
  The Pretenderify server, which has a store and an XHR interceptor.
*/
export default function(options) {
  // Init vars
  var environment = options.environment;

  // Default properties
  this.timing = 400;
  this.namespace = '';

  // Methods
  this.loadConfig = function(config) {
    config.call(this);
  };

  this.loadData = function(data) {
    this.store.loadData(data);
  };

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

  this.get = function(path, handler, code) {
    this.stub('get', path, handler, code);
  };
  this.post = function(path, handler, code) {
    this.stub('post', path, handler, code);
  };
  this.put = function(path, handler, code) {
    this.stub('put', path, handler, code);
  };
  this['delete'] = this.del = function(path, handler, code) {
    this.stub('delete', path, handler, code);
  };

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

  this.pretender = this.interceptor; // alias

  // TODO: Better test api
  if (environment === 'test') {
    window.store = this.store;
  }

  return this;
}
