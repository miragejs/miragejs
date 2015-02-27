import Ember from 'ember';
import Pretender from 'pretender';
import Store from './store';
import frontController from './controllers/front';

/*
  The Pretenderify server, which has a store and an XHR interceptor.

  Requires an environment.
*/
export default function(options) {
  // Init vars
  if (!options || !options.environment) {
    throw "You must pass an environment in when creating a Pretenderify server instance";
  }
  var environment = options.environment;

  /*
    Routing methods + props
  */

  // Default properties
  this.timing = 400;
  this.namespace = '';

  this.loadConfig = function(config) {
    config.call(this);
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

  /*
    Store methods and props
  */
  this.loadData = function(data) {
    this.store.loadData(data);
  };

  this.store = new Store();
  this.emptyStore = function() {
    this.store.emptyData();
  };

  /*
    Factory methods and props
  */
  this.loadFactories = function(factoryMap) {
    this._factoryMap = factoryMap;
  };

  this.create = function(type, overrides) {
    var currentRecords = this.store.findAll(type);
    var sequence = currentRecords ? currentRecords.length: 0;
    if (!this._factoryMap || !this._factoryMap[type]) {
      throw "You're trying to create a " + type + ", but no factory for this type was found";
    }
    var OriginalFactory = this._factoryMap[type];
    var Factory = OriginalFactory.extend(overrides);
    var factory = new Factory();

    var attrs = factory.build(sequence);
    // if (overrides) {
    //   Ember.keys(overrides).forEach(function(key) {
    //     attrs[key] = overrides[key];
    //   });
    // }
    return this.store.push(type, attrs);
  };

  this.createList = function(type, amount, overrides) {
    var list = [];

    for (var i = 0; i < amount; i++) {
      list.push(this.create(type, overrides));
    }

    return list;
  };

  // TODO: Better way to inject server
  if (environment === 'test') {
    window.server = this;
  }

  return this;
}
