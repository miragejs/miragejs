import Ember from 'ember';
import { pluralize } from './utils/inflector';
import Pretender from 'pretender';
import Db from './db';
import controller from './controller';

/*
  Given a variable number of arguments, it generates an array of with
  [path, handler, code, options], `path` and `options` being always defined,
  and `handler` and `code` being undefined if not suplied.
*/
function extractStubArguments(/* path, handler, code, options */) {
  var ary = Array.prototype.slice.call(arguments);
  var argsInitialLength = ary.length;
  var lastArgument = ary[ary.length - 1];
  var options;
  var i = 0;
  if (typeof lastArgument === 'object') {
    argsInitialLength--;
  } else {
    options = { colesce: false };
    ary.push(options);
  }
  for(; i < 5 - ary.length; i++) {
    ary.insertAt(argsInitialLength, undefined);
  }
  return ary;
}

/*
  The Mirage server, which has a db and an XHR interceptor.

  Requires an environment.
*/
export default function(options) {
  // Init vars
  var server = this;

  if (!options || !options.environment) {
    throw "You must pass an environment in when creating a Mirage server instance";
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
    this.timing = environment === 'test' ? 0 : (this.timing || 0);
  };

  this.stub = function(verb, path, handler, code, options) {
    var _this = this;
    path = path[0] === '/' ? path.slice(1) : path;

    this.interceptor[verb].call(this.interceptor, this.namespace + '/' + path, function(request) {
      var response = controller.handle(verb, handler, _this.db, request, code, options);
      var shouldLog = typeof server.logging !== 'undefined' ? server.logging : (environment !== 'test');

      if (shouldLog) {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, function() { return _this.timing; });
  };

  [['get'], ['post'], ['put'], ['delete', 'del']].forEach(function(names) {
    var verb = names[0];
    var alias = names[1];

    server[verb] = function(/* path, handler, code, options */) {
      var args = extractStubArguments.apply(this, arguments);
      args.unshift(verb);
      this.stub.apply(this, args);
    };

    if (alias) { server[alias] = server[verb]; }
  });

  /*
    Pretender instance with default config.

    TODO: Inject?
  */
  this.interceptor = new Pretender(function() {
    this.prepareBody = function(body) {
      return body ? JSON.stringify(body) : '{"error": "not found"}';
    };

    this.unhandledRequest = function(verb, path) {
      path = decodeURI(path);
      console.error("Mirage: Your Ember app tried to " + verb + " '" + path +
                    "', but there was no route defined to handle this " +
                    "request. Define a route that matches this path in your " +
                    "mirage/config.js file.");
    };
  });

  this.pretender = this.interceptor; // alias

  /*
    Db instance

    TODO: Inject?
  */
  this.db = new Db();

  /*
    Factory methods and props
  */
  this.loadFactories = function(factoryMap) {
    var _this = this;
    // Store a reference to the factories
    this._factoryMap = factoryMap;

    // Create a collection for each factory
    Ember.keys(factoryMap).forEach(function(type) {
      _this.db.createCollection(pluralize(type));
    });
  };

  this.create = function(type, overrides) {
    var collection = pluralize(type);
    var currentRecords = this.db[collection];
    var sequence = currentRecords ? currentRecords.length: 0;
    if (!this._factoryMap || !this._factoryMap[type]) {
      throw "You're trying to create a " + type + ", but no factory for this type was found";
    }
    var OriginalFactory = this._factoryMap[type];
    var Factory = OriginalFactory.extend(overrides);
    var factory = new Factory();

    var attrs = factory.build(sequence);
    return this.db[collection].insert(attrs);
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
