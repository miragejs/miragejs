import { pluralize } from './utils/inflector';
import Pretender from 'pretender';
import Db from './db';
import Schema from './orm/schema';
import Controller from './controller';
import Serializer from './serializer';
import SerializerRegistry from './serializer-registry';
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
    this.controller = new Controller(new Serializer());
    this.db = new Db();

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

    if (options.modelsMap) {
      // TODO: really should be injected into Controller, server doesn't need to know about schema
      this.schema = new Schema(this.db);
      this.schema.registerModels(options.modelsMap);
      this.controller.setSerializerRegistry(new SerializerRegistry(this.schema, options.serializersMap));
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
    [['get'], ['post'], ['put'], ['delete', 'del'], ['patch']]
    .forEach(([verb, alias]) => {
      this[verb] = (...options) => {
        new RouteHandler(this, verb, options);
      };

      if (alias) { this[alias] = this[verb]; }
    });
  }


}
