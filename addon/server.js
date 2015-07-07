import { pluralize } from './utils/inflector';
import Pretender from 'pretender';
import Db from './db';
import Schema from './orm/schema';
import Controller from './controller';
import Serializer from './serializer';

/*
  The Mirage server, which has a db and an XHR interceptor.
  Requires an environment.
*/
export default class Server {

  constructor(options) {
    if (!options || !options.environment) {
      throw "You must pass an environment in when creating a Mirage server instance";
    }

    this.environment = options.environment;
    this.timing = 400;
    this.namespace = '';
    this.urlPrefix = '';

    this._setupStubAliases();

    /*
      Bootstrap dependencies

      TODO: Inject / belongs in a container
    */
    this.controller = new Controller(new Serializer());
    this.db = new Db();

    this.interceptor = new Pretender(function() {
      this.prepareBody = function(body) {
        return body ? JSON.stringify(body) : '{"error": "not found"}';
      };

      this.unhandledRequest = function(verb, path) {
        path = decodeURI(path);
        console.error("Mirage: Your Ember app tried to " + verb + " '" + path +
                      "', but there was no route defined to handle this " +
                      "request. Define a route that matches this path in your " +
                      "mirage/config.js file. Did you forget to add your namespace?");
      };
    });
    this.pretender = this.interceptor; // alias

    if (options.modelsMap) {
      this.schema = new Schema(this.db);
      this.schema.registerModels(options.modelsMap);
    }

    // TODO: Better way to inject server into test env
    if (this.environment === 'test') {
      window.server = this;
    }
  }

  loadConfig(config) {
    config.call(this);
    this.timing = this.environment === 'test' ? 0 : (this.timing || 0);
  }

  // TODO: Move all this logic to another object (route?)
  stub(verb, path, handler, code, options) {
    var _this = this;
    path = path[0] === '/' ? path.slice(1) : path;

    this.interceptor[verb].call(this.interceptor, this.namespace + '/' + path, function(request) {
      var response = _this.controller.handle(verb, handler, (_this.schema || _this.db), request, code, options);
      var shouldLog = typeof _this.logging !== 'undefined' ? _this.logging : (_this.environment !== 'test');

      if (shouldLog) {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, function() { return _this.timing; });
  }

  /*
    Factory methods
  */
  loadFactories(factoryMap) {
    var _this = this;
    // Store a reference to the factories
    this._factoryMap = factoryMap;

    // Create a collection for each factory
    _.keys(factoryMap).forEach(function(type) {
      _this.db.createCollection(pluralize(type));
    });
  }

  create(type, overrides) {
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
  }

  createList(type, amount, overrides) {
    var list = [];

    for (var i = 0; i < amount; i++) {
      list.push(this.create(type, overrides));
    }

    return list;
  }

  shutdown() {
    this.pretender.shutdown();
    if (this.environment === 'test') {
      window.server = undefined;
    }
  }

  _setupStubAliases() {
    var _this = this;

    [['get'], ['post'], ['put'], ['delete', 'del'], ['patch']].forEach(function(names) {
      var verb = names[0];
      var alias = names[1];

      _this[verb] = function(/* path, handler, code, options */) {
        var args = _this._extractStubArguments.apply(this, arguments);
        args.unshift(verb);
        this.stub.apply(this, args);
      };

      if (alias) { _this[alias] = _this[verb]; }
    });
  }

  /*
    Given a variable number of arguments, it generates an array of with
    [path, handler, code, options], `path` and `options` being always defined,
    and `handler` and `code` being undefined if not suplied.
  */
  _extractStubArguments(/* path, handler, code, options */) {
    var ary = Array.prototype.slice.call(arguments);
    var argsInitialLength = ary.length;
    var lastArgument = ary[ary.length - 1];
    var options;
    var i = 0;
    if (lastArgument.constructor === Object) {
      argsInitialLength--;
    } else {
      options = { colesce: false };
      ary.push(options);
    }
    for(; i < 5 - ary.length; i++) {
      ary.splice(argsInitialLength, 0, undefined);
    }
    return ary;
  }

  /*
    Builds a full path for Pretender to monitor based on the `path` and
    configured options (`urlPrefix` and `namespace`).
  */
  _getFullPath(path) {
    var fullPath = '',
        urlPrefix = this.urlPrefix ? this.urlPrefix.trim() : '',
        namespace = this.namespace ? this.namespace.trim() : '';

    // check to see if path is a FQDN. if so, ignore any urlPrefix/namespace that was set
    if (/^https?:\/\//.test(path)) {
      fullPath += path;
    } else {

      // otherwise, if there is a urlPrefix, use that as the beginning of the path
      if (!!urlPrefix.length) {
        fullPath += urlPrefix[urlPrefix.length - 1] === '/' ? urlPrefix : urlPrefix + '/';
      }

      // if a namespace has been configured, add it before the path
      if (!!namespace.length) {
        fullPath += namespace ? namespace + '/' : namespace;
      }

      // finally add the configured path
      fullPath += path;
    }

    return fullPath;
  }

}
