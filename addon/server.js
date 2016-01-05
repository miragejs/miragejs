import { pluralize, camelize } from './utils/inflector';
import Pretender from 'pretender';
import Db from './db';
import Schema from './orm/schema';
import MirageError from './error';
import SerializerRegistry from './serializer-registry';
import RouteHandler from './route-handler';

import _isArray from 'lodash/lang/isArray';
import _keys from 'lodash/object/keys';
import _pick from 'lodash/object/pick';

function createPretender(shouldLog) {
  return new Pretender(function() {
    this.handledRequest = function(verb, path, request) {
      if (shouldLog) {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(request.responseText);
      }
    };

    this.unhandledRequest = function(verb, path) {
      path = decodeURI(path);
      throw new MirageError(
        `Mirage: Your Ember app tried to ${verb} '${path}',
         but there was no route defined to handle this request.
         Define a route that matches this path in your
         mirage/config.js file. Did you forget to add your namespace?`
      );
    };
  });
}

export default class Server {

  constructor(options = {}) {
    this.environment = options.environment || 'development';
    this.options = options;
    this.timing = 400;
    this.namespace = '';
    this.urlPrefix = '';

    this._defineRouteHandlerHelpers();

    this.db = new Db();
    this.schema = new Schema(this.db);
    this.schema.registerModels(options.models);
    this.serializerOrRegistry = new SerializerRegistry(this.schema, options.serializers);

    const isTest = this.environment === 'test';
    const hasFactories = this._hasModulesOfType(options, 'factories');
    const hasDefaultScenario = options.scenarios && options.scenarios.hasOwnProperty('default');
    const shouldLog = typeof this.logging !== 'undefined' ? this.logging : !isTest;

    this.pretender = createPretender(shouldLog);

    if (options.baseConfig) {
      this.loadConfig(options.baseConfig);
    }

    if (isTest) {
      if (options.testConfig) { this.loadConfig(options.testConfig); }
      window.server = this; // TODO: Better way to inject server into test env
    }

    if (isTest && hasFactories) {
      this.loadFactories(options.factories);
    } else if (!isTest && hasDefaultScenario && hasFactories) {
      this.loadFactories(options.factories);
      options.scenarios.default(this);
    } else {
      this.loadFixtures();
    }
  }

  loadConfig(config) {
    config.call(this);
    this.timing = this.environment === 'test' ? 0 : (this.timing || 0);
  }

  passthrough(...paths) {
    let verbs = ['get', 'post', 'put', 'delete', 'patch'];
    let lastArg = paths[paths.length-1];

    if (paths.length === 0) {
      paths = ['/*catchall'];
    } else if (_isArray(lastArg)) {
      verbs = paths.pop();
    }

    verbs.forEach(verb => {
      paths.map(path => this._getFullPath(path))
        .forEach(path => {
          this.pretender[verb](path, this.pretender.passthrough);
        });
    });
  }

  loadFixtures(...args) {
    let fixtures = this.options.fixtures;
    if (args.length) {
      fixtures = _pick(fixtures, ...args);
    }

    this.db.loadData(fixtures);
  }

  /*
    Factory methods
  */
  loadFactories(factoryMap) {
    // Store a reference to the factories
    this._factoryMap = factoryMap;

    // Create a collection for each factory
    _keys(factoryMap).forEach(type => {
      let collectionName = this.schema ? pluralize(camelize(type)) : pluralize(type);
      this.db.createCollection(collectionName);
    });
  }

  build(type, overrides) {

    // Store sequence for factory type as instance variable
    this.factorySequences = this.factorySequences || {};
    this.factorySequences[type] = this.factorySequences[type] + 1 || 0;

    if (!this._factoryMap || !this._factoryMap[type]) {
      throw "You're trying to create a " + type + ", but no factory for this type was found";
    }

    const OriginalFactory = this._factoryMap[type];
    const Factory = OriginalFactory.extend(overrides);
    const factory = new Factory();

    const sequence = this.factorySequences[type];
    return factory.build(sequence);
  }

  buildList(type, amount, overrides) {
    const list = [];

    for (let i = 0; i < amount; i++) {
      list.push(this.build(type, overrides));
    }

    return list;
  }

  create(type, overrides, collectionFromCreateList) {
    const attrs = this.build(type, overrides);
    let collection, collectionName;
    if (collectionFromCreateList) {
      collection = collectionFromCreateList;
    } else {
      collectionName = this.schema ? pluralize(camelize(type)) : pluralize(type);
      collection = this.db[collectionName];
    }

    return collection.insert(attrs);
  }

  createList(type, amount, overrides) {
    const list = [];
    const collectionName = this.schema ? pluralize(camelize(type)) : pluralize(type);
    const collection = this.db[collectionName];

    for (let i = 0; i < amount; i++) {
      list.push(this.create(type, overrides, collection));
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
        this._registerRouteHandler(verb, path, args);
      };

      if (alias) { this[alias] = this[verb]; }
    });
  }

  _serialize(body) {
    if (body) {
      return typeof body !== 'string' ? JSON.stringify(body) : body;
    } else {
      return '{"error": "not found"}';
    }
  }

  _registerRouteHandler(verb, path, args) {
    let routeHandler = new RouteHandler(this.schema, verb, args, this.serializerOrRegistry);
    let fullPath = this._getFullPath(path);

    this.pretender[verb](fullPath, request => {
      let [ code, headers, response ] = routeHandler.handle(request);
      return [ code, headers, this._serialize(response) ];
    }, () => { return this.timing; });
  }

  _hasModulesOfType(modules, type) {
    let modulesOfType = modules[type];
    return modulesOfType ? _keys(modulesOfType).length > 0 : false;
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
