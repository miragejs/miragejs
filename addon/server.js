import { pluralize } from './utils/inflector';
import Pretender from 'pretender';
import Db from './db';
import Schema from './orm/schema';
import Serializer from './serializer';
import SerializerRegistry from './serializer-registry';
import RouteDefinitionReader from './route-definition-reader';
import RouteHandler from './route-handler';

export default class Server {

  constructor(options = {}) {
    this.environment = options.environment || 'development';
    this.timing = 400;
    this.namespace = '';
    this.urlPrefix = '';

    this._defineRouteHandlerHelpers();

    /*
      Bootstrap dependencies

      TODO: Inject / belongs in a container
    */
    this.db = new Db();

    this.routeDefinitionReader = new RouteDefinitionReader();
    this.pretender = this.interceptor = new Pretender(function() {
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

    if (this._hasModulesOfType(options, 'models')) {
      // TODO: really should be injected into Controller, server doesn't need to know about schema
      this.schema = new Schema(this.db);
      this.schema.registerModels(options.models);
      this.serializerRegistry = new SerializerRegistry(this.schema, options.serializers);
    }

    // TODO: Better way to inject server into test env
    if (this.environment === 'test') {
      window.server = this;
    }

    let hasFactories = this._hasModulesOfType(options, 'factories');
    let hasDefaultScenario = options.scenarios && options.scenarios.hasOwnProperty('default');

    if (options.baseConfig) {
      this.loadConfig(options.baseConfig);
    }

    if (this.environment === 'test' && options.testConfig) {
      this.loadConfig(options.testConfig);
    }

    if (this.environment === 'test' && hasFactories) {
      this.loadFactories(options.factories);

    } else if (this.environment !== 'test' && hasDefaultScenario && hasFactories) {
      this.loadFactories(options.factories);
      options.scenarios.default(this);

    } else {
      this.db.loadData(options.fixtures);
    }
  }

  loadConfig(config) {
    config.call(this);
    this.timing = this.environment === 'test' ? 0 : (this.timing || 0);
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

  _defineRouteHandlerHelpers() {
    [['get'], ['post'], ['put'], ['delete', 'del'], ['patch']].forEach(([verb, alias]) => {
      this[verb] = (path, ...args) => {
        let fullPath = this._getFullPath(path);
        let {handler, customizedCode} = this.routeDefinitionReader.read(verb, args);
        this._createAndRegisterRouteHandler(verb, fullPath, handler, customizedCode);
      };

      if (alias) { this[alias] = this[verb]; }
    });
  }

  _createAndRegisterRouteHandler(verb, fullPath, standardF, customizedCode) {
    let serializerOrRegistry = (this.serializerRegistry || new Serializer());
    let routeHandler = new RouteHandler(verb, serializerOrRegistry, standardF, customizedCode);

    this.pretender[verb](fullPath, request => {
      let dbOrSchema = (this.schema || this.db);
      let response = routeHandler.handle(dbOrSchema, request);

      let shouldLog = typeof this.logging !== 'undefined' ? this.logging : (this.environment !== 'test');

      if (shouldLog) {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, () => { return this.timing; });
  }

  _hasModulesOfType(modules, type) {
    let modulesOfType = modules[type] || {};

    return _.keys(modulesOfType).length > 0;
  }

  /*
    Builds a full path for Pretender to monitor based on the `path` and
    configured options (`urlPrefix` and `namespace`).
  */
  _getFullPath(path) {
    path = path[0] === '/' ? path.slice(1) : path;
    let fullPath = '';
    let urlPrefix = this.urlPrefix ? this.urlPrefix.trim() : '';
    let namespace = this.namespace ? this.namespace.trim() : '';

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
