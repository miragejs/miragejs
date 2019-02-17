/* eslint no-console: 0 */

import { Promise } from 'rsvp';
import { singularize, pluralize, camelize } from './utils/inflector';
import { toCollectionName, toInternalCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import { getModels } from './ember-data';
import { hasEmberData } from './utils/ember-data';
import isAssociation from 'ember-cli-mirage/utils/is-association';
import Pretender from 'pretender';
import Db from './db';
import Schema from './orm/schema';
import assert from './assert';
import SerializerRegistry from './serializer-registry';
import RouteHandler from './route-handler';
import BelongsTo from './orm/associations/belongs-to';

import _pick from 'lodash/pick';
import _assign from 'lodash/assign';
import _find from 'lodash/find';
import _isPlainObject from 'lodash/isPlainObject';
import _isInteger from 'lodash/isInteger';

/**
 * Creates a new Pretender instance.
 *
 * @method createPretender
 * @param {Server} server
 * @return {Object} A new Pretender instance.
 * @public
 */
function createPretender(server) {
  return new Pretender(function() {
    this.passthroughRequest = function(verb, path, request) {
      if (server.shouldLog()) {
        console.log(`Passthrough request: ${verb.toUpperCase()} ${request.url}`);
      }
    };

    this.handledRequest = function(verb, path, request) {
      if (server.shouldLog()) {
        console.groupCollapsed(
          `Mirage: [${request.status}] ${verb.toUpperCase()} ${request.url}`
        );
        let { requestBody, responseText } = request;
        let loggedRequest, loggedResponse;

        try {
          loggedRequest = JSON.parse(requestBody);
        } catch(e) {
          loggedRequest = requestBody;
        }

        try {
          loggedResponse = JSON.parse(responseText);
        } catch(e) {
          loggedResponse = responseText;
        }

        console.log({
          request: loggedRequest,
          response: loggedResponse,
          raw: request
        });
        console.groupEnd();
      }
    };

    this.unhandledRequest = function(verb, path) {
      path = decodeURI(path);
      assert(
        `Your Ember app tried to ${verb} '${path}',
         but there was no route defined to handle this request.
         Define a route that matches this path in your
         mirage/config.js file. Did you forget to add your namespace?`
      );
    };
  }, { trackRequests: server.shouldTrackRequests() });
}

const defaultRouteOptions = {
  coalesce: false,
  timing: undefined
};

/**
  @hide
*/
const defaultPassthroughs = [
  'http://localhost:0/chromecheckurl', // mobile chrome
  'http://localhost:30820/socket.io' // electron
];

/**
  @hide
*/
export { defaultPassthroughs };

/**
 * Determine if the object contains a valid option.
 *
 * @method isOption
 * @param {Object} option An object with one option value pair.
 * @return {Boolean} True if option is a valid option, false otherwise.
 * @private
 */
function isOption(option) {
  if (!option || typeof option !== 'object') {
    return false;
  }

  let allOptions = Object.keys(defaultRouteOptions);
  let optionKeys = Object.keys(option);
  for (let i = 0; i < optionKeys.length; i++) {
    let key = optionKeys[i];
    if (allOptions.indexOf(key) > -1) {
      return true;
    }
  }
  return false;
}

/**
 * Extract arguments for a route.
 *
 * @method extractRouteArguments
 * @param {Array} args Of the form [options], [object, code], [function, code]
 * [shorthand, options], [shorthand, code, options]
 * @return {Array} [handler (i.e. the function, object or shorthand), code,
 * options].
 * @private
 */
function extractRouteArguments(args) {
  let [ lastArg ] = args.splice(-1);
  if (isOption(lastArg)) {
    lastArg = _assign({}, defaultRouteOptions, lastArg);
  } else {
    args.push(lastArg);
    lastArg = defaultRouteOptions;
  }
  let t = 2 - args.length;
  while (t-- > 0) {
    args.push(undefined);
  }
  args.push(lastArg);
  return args;
}

/**
  The Mirage server.

  Note that `this` within your config function in `mirage/config.js` refers to the server instance, which is the same instance that `server` refers to in your tests.

  @class Server
  @public
*/
export default class Server {

  constructor(options = {}) {
    this.config(options);

    /**
      Returns the Mirage Db instance.

      @property db
      @return Db
    */
    this.db = this.db || undefined;

    /**
      Returns the Mirage Schema (ORM) instance.

      @property schema
      @return Schema
    */
    this.schema = this.schema || undefined;
  }

  config(config = {}) {
    let didOverrideConfig = (config.environment && (this.environment && (this.environment !== config.environment)));
    assert(!didOverrideConfig,
      'You cannot modify Mirage\'s environment once the server is created');
    this.environment = config.environment || this.environment || 'development';

    this._config = config;

    /**
      Set the base namespace used for all routes defined with `get`, `post`, `put` or `del`.

      For example,

      ```js
      // mirage/config.js
      export default function() {
        this.namespace = '/api';

        // this route will handle the URL '/api/contacts'
        this.get('/contacts', 'contacts');
      };
      ```

      Note that only routes defined after `this.namespace` are affected. This is useful if you have a few one-off routes that you don't want under your namespace:

      ```js
      // mirage/config.js
      export default function() {

        // this route handles /auth
        this.get('/auth', function() { ...});

        this.namespace = '/api';
        // this route will handle the URL '/api/contacts'
        this.get('/contacts', 'contacts');
      };
      ```

      If your Ember app is loaded from the filesystem vs. a server (e.g. via Cordova or Electron vs. `ember s` or `https://yourhost.com/`), you will need to explicitly define a namespace. Likely values are `/` (if requests are made with relative paths) or `https://yourhost.com/api/...` (if requests are made to a defined server).

      For a sample implementation leveraging a configured API host & namespace, check out [this issue comment](https://github.com/samselikoff/ember-cli-mirage/issues/497#issuecomment-183458721).

      @property namespace
      @type String
      @public
    */
    this.namespace = this.namespace || config.namespace || '';

    /**
      Sets a string to prefix all route handler URLs with.

      Useful if your Ember app makes API requests to a different port.

      ```js
      // mirage/config.js
      export default function() {
        this.urlPrefix = 'http://localhost:8080'
      };
      ```
    */
    this.urlPrefix = this.urlPrefix || config.urlPrefix || '';

    /**
      Set the number of milliseconds for the the Server's response time.

      By default there's a 400ms delay during development, and 0 delay in testing (so your tests run fast).

      ```js
      // mirage/config.js
      export default function() {
        this.timing = 400; // default
      };
      ```

      To set the timing for individual routes, see the `timing` option for route handlers.

      @property timing
      @type Number
      @public
    */
    this.timing = this.timing || config.timing || 400;

    /**
      Set to `true` or `false` to explicitly specify logging behavior.

      By default, server responses are logged in non-testing environments. Logging is disabled by default in testing, so as not to clutter CI test runner output.

      For example, to enable logging in tests, write the following:

      ```js
      test('I can view all users', function() {
        server.logging = true;
        server.create('user');

        visit('/users');
        // ...
      });
      ```

      You can also write a custom log message, using the [Pretender server's](#pretender) `handledRequest` hook. See [Mirage's default implementation](https://github.com/samselikoff/ember-cli-mirage/blob/2c31ad15a46e90b357a83b6896c6774fa42c6488/addon/server.js#L25) for an example.

      To override,

      ```js
      // mirage/config.js
      export default function() {
        this.pretender.handledRequest = function(verb, path, request) {
          let { responseText } = request;
          // log request and response data
        }
      }
      ```

      @property logging
      @return {Boolean}
      @public
    */
    this.logging = this.logging || undefined;

    /**
      Export a named `testConfig` function to define routes that only apply in your test environment:

      ```js
      // mirage/config.js
      export default function() {
        // normal config, shared across development + testing
      }

      export function testConfig() {
        // test-only config, does not apply to development
      }
      ```

      This could be useful if you'd like to use Mirage in testing, but generally proxy to an actual API during development. As you develop, your frontend may be ahead of your API, in which case you'd work with the routes in the default config, and write your tests. Then, once your API implements the new endpoints, you can move the routes to your testConfig, so your tests still run, but Mirage doesn't interfere during development.
    */
    this.testConfig = this.testConfig || undefined;

    this.trackRequests = config.trackRequests;

    this._defineRouteHandlerHelpers();

    // Merge models from autogenerated Ember Data models with user defined models
    if (hasEmberData && config.discoverEmberDataModels) {
      let models = {};
      _assign(models, getModels(), config.models || {});
      config.models = models;
    }

    if (this.db) {
      this.db.registerIdentityManagers(config.identityManagers);
    } else {
      this.db = new Db(undefined, config.identityManagers);
    }

    if (this.schema) {
      this.schema.registerModels(config.models);
      this.serializerOrRegistry.registerSerializers(config.serializers || {});
    } else {
      this.schema = new Schema(this.db, config.models);
      this.serializerOrRegistry = new SerializerRegistry(this.schema, config.serializers);
    }

    let hasFactories = this._hasModulesOfType(config, 'factories');
    let hasDefaultScenario = config.scenarios && config.scenarios.hasOwnProperty('default');

    let didOverridePretenderConfig = (config.trackRequests !== undefined) && this.pretender;
    assert(
      !didOverridePretenderConfig,
      'You cannot modify Pretender\'s request tracking once the server is created'
    );

    /**
      Mirage uses [pretender.js](https://github.com/trek/pretender) as its xhttp interceptor. In your Mirage config, `this.pretender` refers to the actual Pretender instance, so any config options that work there will work here as well.

      ```js
      // mirage/config.js
      export default function() {
        this.pretender.handledRequest = (verb, path, request) => {
          console.log(`Your server responded to ${path}`);
        }
      };
      ```

      Refer to [Pretender's docs](https://github.com/pretenderjs/pretender) if you want to change any options on your Pretender instance.

      @property pretender
      @return {Object} The Pretender instance
      @public
    */
    this.pretender = this.pretender || config.pretender || createPretender(this);

    if (config.baseConfig) {
      this.loadConfig(config.baseConfig);
    }

    if (this.isTest()) {
      if (config.testConfig) {
        this.loadConfig(config.testConfig);
      }

      window.server = this; // TODO: Better way to inject server into test env
    }

    if (this.isTest() && hasFactories) {
      this.loadFactories(config.factories);
    } else if (!this.isTest() && hasDefaultScenario) {
      this.loadFactories(config.factories);
      config.scenarios.default(this);
    } else {
      this.loadFixtures();
    }

    if (config.useDefaultPassthroughs) {
      this._configureDefaultPassthroughs();
    }
  }

  /**
   * Determines if the current environment is the testing environment.
   *
   * @method isTest
   * @return {Boolean} True if the environment is 'test', false otherwise.
   * @public
   * @hide
   */
  isTest() {
    return this.environment === 'test';
  }

  /**
    Determines if the server should log.

    @method shouldLog
    @return The value of this.logging if defined, or false if in the testing environment,
    true otherwise.
    @public
    @hide
  */
  shouldLog() {

    return typeof this.logging !== 'undefined' ? this.logging : !this.isTest();
  }

  /**
   * Determines if the server should track requests.
   *
   * @method shouldTrackRequests
   * @return The value of this.trackRequests if defined, false otherwise.
   * @public
   * @hide
   */
  shouldTrackRequests() {
    return Boolean(this.trackRequests);
  }

  /**
   * Load the configuration given, setting timing to 0 if in the test
   * environment.
   *
   * @method loadConfig
   * @param {Object} config The configuration to load.
   * @public
   * @hide
   */
  loadConfig(config) {
    config.call(this);
    this.timing = this.isTest() ? 0 : (this.timing || 0);
  }

  /**
    By default, if your Ember app makes a request that is not defined in your server config, Mirage will throw an error. You can use `passthrough` to whitelist requests, and allow them to pass through your Mirage server to the actual network layer.

    <aside>
    <p>Note: Put all passthrough config at the bottom of your <code>config.js</code> file, to give your route handlers precedence.</p>
    </aside>

    To ignore paths on your current host (as well as configured `namespace`), use a leading `/`:

    ```js
    this.passthrough('/addresses');
    ```

    You can also pass a list of paths, or call `passthrough` multiple times:

    ```js
    this.passthrough('/addresses', '/contacts');
    this.passthrough('/something');
    this.passthrough('/else');
    ```

    These lines will allow all HTTP verbs to pass through. If you want only certain verbs to pass through, pass an array as the last argument with the specified verbs:

    ```js
    this.passthrough('/addresses', ['post']);
    this.passthrough('/contacts', '/photos', ['get']);
    ```

    If you want all requests on the current domain to pass through, simply invoke the method with no arguments:

    ```js
    this.passthrough();
    ```

    Note again that the current namespace (i.e. any `namespace` property defined above this call) will be applied.

    You can also allow other-origin hosts to passthrough. If you use a fully-qualified domain name, the `namespace` property will be ignored. Use two * wildcards to match all requests under a path:

    ```js
    this.passthrough('http://api.foo.bar/**');
    this.passthrough('http://api.twitter.com/v1/cards/**');
    ```

    In versions of Pretender prior to 0.12, `passthrough` only worked with jQuery >= 2.x. As long as you're on Pretender@0.12 or higher, you should be all set.

    @method passthrough
    @param {String} [...paths] Any numer of paths to whitelist
    @param {Array} options Unused
    @public
  */
  passthrough(...paths) {
    let verbs = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    let lastArg = paths[paths.length - 1];

    if (paths.length === 0) {
      // paths = ['http://localhost:7357'];
      paths = ['/**', '/'];
    } else if (Array.isArray(lastArg)) {
      verbs = paths.pop();
    }

    verbs.forEach((verb) => {
      paths.forEach((path) => {
        let fullPath = this._getFullPath(path);
        this.pretender[verb](fullPath, this.pretender.passthrough);
      });
    });
  }

  /**
    By default, all the data files under `/fixtures` will be loaded during testing if you don't have factories defined, and during development if you don't have `/scenarios/default.js` defined. You can use `loadFixtures()` to also load fixture files in either of these environments, in addition to using factories to seed your database.

    `server.loadFixtures()` loads all the files, and `server.loadFixtures(file1, file2...)` loads selective fixture files.

    For example, in a test you may want to start out with all your fixture data loaded:

    ```js
    test('I can view the photos', function() {
      server.loadFixtures();
      server.createList('photo', 10);

      visit('/');

      andThen(() => {
        equal( find('img').length, 10 );
      });
    });
    ```

    or in development, you may want to load a few reference fixture files, and use factories to define the rest of your data:

    ```js
    // scenarios/default.js
    export default function(server) {
      server.loadFixtures('countries', 'states');

      let author = server.create('author');
      server.createList('post', 10, {author_id: author.id});
    }
    ```

    @method loadFixtures
    @param {String} [...args] The name of the fixture to load.
    @public
  */
  loadFixtures(...args) {
    let { fixtures } = this._config;
    if (args.length) {
      let camelizedArgs = args.map(camelize);
      fixtures = _pick(fixtures, ...camelizedArgs);
    }

    this.db.loadData(fixtures);
  }

  /*
    Factory methods
  */

  /**
   * Load factories into Mirage's database.
   *
   * @method loadFactories
   * @param {Object} factoryMap
   * @public
   * @hide
   */
  loadFactories(factoryMap = {}) {
    // Store a reference to the factories
    let currentFactoryMap = this._factoryMap || {};
    this._factoryMap = _assign(currentFactoryMap, factoryMap);

    // Create a collection for each factory
    Object.keys(factoryMap).forEach((type) => {
      let collectionName = toCollectionName(type);
      this.db.createCollection(collectionName);
    });
  }

  /**
   * Get the factory for a given type.
   *
   * @method factoryFor
   * @param {String} type
   * @private
   * @hide
   */
  factoryFor(type) {
    let camelizedType = camelize(type);

    if (this._factoryMap && this._factoryMap[camelizedType]) {
      return this._factoryMap[camelizedType];
    }
  }

  build(type, ...traitsAndOverrides) {
    let traits = traitsAndOverrides.filter((arg) => arg && typeof arg === 'string');
    let overrides = _find(traitsAndOverrides, (arg) => _isPlainObject(arg));
    let camelizedType = camelize(type);

    // Store sequence for factory type as instance variable
    this.factorySequences = this.factorySequences || {};
    this.factorySequences[camelizedType] = this.factorySequences[camelizedType] + 1 || 0;

    let OriginalFactory = this.factoryFor(type);
    if (OriginalFactory) {
      OriginalFactory = OriginalFactory.extend({});
      let attrs = OriginalFactory.attrs || {};
      this._validateTraits(traits, OriginalFactory, type);
      let mergedExtensions = this._mergeExtensions(attrs, traits, overrides);
      this._mapAssociationsFromAttributes(type, attrs, overrides);
      this._mapAssociationsFromAttributes(type, mergedExtensions);

      let Factory = OriginalFactory.extend(mergedExtensions);
      let factory = new Factory();

      let sequence = this.factorySequences[camelizedType];
      return factory.build(sequence);
    } else {
      return overrides;
    }
  }

  buildList(type, amount, ...traitsAndOverrides) {
    assert(_isInteger(amount), `second argument has to be an integer, you passed: ${typeof amount}`);

    let list = [];

    for (let i = 0; i < amount; i++) {
      list.push(this.build(type, ...traitsAndOverrides));
    }

    return list;
  }

  /**
    Generates a single model of type *type*, inserts it into the database (giving it an id), and returns the data that was
    added.

    ```js
    test("I can view a contact's details", function() {
      var contact = server.create('contact');

      visit('/contacts/' + contact.id);

      andThen(() => {
        equal( find('h1').text(), 'The contact is Link');
      });
    });
    ```

    You can override the attributes from the factory definition with a
    hash passed in as the second parameter. For example, if we had this factory

    ```js
    export default Factory.extend({
      name: 'Link'
    });
    ```

    we could override the name like this:

    ```js
    test("I can view the contacts", function() {
      server.create('contact', {name: 'Zelda'});

      visit('/');

      andThen(() => {
        equal( find('p').text(), 'Zelda' );
      });
    });
    ```

    @method create
    @param type
    @param traitsAndOverrides
    @public
  */
  create(type, ...options) {
    if (this._typeIsPluralForModel(type)) {
      console.warn(`Mirage [deprecation]: You called server.create('${type}'), but server.create was intended to be used with the singularized version of the model. Please change this to server.create('${singularize(type)}'). This behavior will be removed in 1.0.`);

      type = singularize(type);
    }

    // When there is a Model defined, we should return an instance
    // of it instead of returning the bare attributes.
    let traits = options.filter((arg) => arg && typeof arg === 'string');
    let overrides = _find(options, (arg) => _isPlainObject(arg));
    let collectionFromCreateList = _find(options, (arg) => arg && Array.isArray(arg));

    let attrs = this.build(type, ...traits, overrides);
    let modelOrRecord;

    if (this.schema && this.schema[toCollectionName(type)]) {
      let modelClass = this.schema[toCollectionName(type)];

      modelOrRecord = modelClass.create(attrs);

    } else {
      let collection, collectionName;

      if (collectionFromCreateList) {
        collection = collectionFromCreateList;
      } else {
        collectionName = this.schema ? toInternalCollectionName(type) : `_${pluralize(type)}`;
        collection = this.db[collectionName];
      }

      assert(collection, `You called server.create('${type}') but no model or factory was found.`);
      modelOrRecord = collection.insert(attrs);
    }

    let OriginalFactory = this.factoryFor(type);
    if (OriginalFactory) {
      OriginalFactory.extractAfterCreateCallbacks({ traits }).forEach((afterCreate) => {
        afterCreate(modelOrRecord, this);
      });
    }

    return modelOrRecord;
  }

  /**
    Creates *amount* models of type *type*, optionally overriding the attributes from the factory with *attrs*.

    Returns the array of records that were added to the database.

    Here's an example from a test:

    ```js
    test("I can view the contacts", function() {
      server.createList('contact', 5);
      var youngContacts = server.createList('contact', 5, {age: 15});

      visit('/');

      andThen(function() {
        equal(currentRouteName(), 'index');
        equal( find('p').length, 10 );
      });
    });
    ```

    And one from setting up your development database:

    ```js
    // mirage/scenarios/default.js
    export default function(server) {
      var contact = server.create('contact');
      server.createList('address', 5, {contactId: contact.id});
    }
    ```

    @method createList
    @param type
    @param amount
    @param traitsAndOverrides
    @public
  */
  createList(type, amount, ...traitsAndOverrides) {
    assert(
      this._modelOrFactoryExistsForTypeOrCollectionName(type),
      `You called server.createList('${type}') but no model or factory was found.`
    );

    if (this._typeIsPluralForModel(type)) {
      console.warn(`Mirage [deprecation]: You called server.createList('${type}'), but server.createList was intended to be used with the singularized version of the model. Please change this to server.createList('${singularize(type)}'). This behavior will be removed in 1.0.`);

      type = singularize(type);
    }
    assert(_isInteger(amount), `second argument has to be an integer, you passed: ${typeof amount}`);

    let list = [];
    let collectionName = this.schema ? toInternalCollectionName(type) : `_${pluralize(type)}`;
    let collection = this.db[collectionName];

    for (let i = 0; i < amount; i++) {
      list.push(this.create(type, ...traitsAndOverrides, collection));
    }

    return list;
  }

  shutdown() {
    this.pretender.shutdown();
    if (this.environment === 'test') {
      window.server = undefined;
    }
  }

  resource(resourceName, { only, except, path } = {}) {
    resourceName = pluralize(resourceName);
    path = path || `/${resourceName}`;
    only = only || [];
    except = except || [];

    if (only.length > 0 && except.length > 0) {
      throw 'cannot use both :only and :except options';
    }

    let actionsMethodsAndsPathsMappings = {
      index: { methods: ['get'], path: `${path}` },
      show: { methods: ['get'], path: `${path}/:id` },
      create: { methods: ['post'], path: `${path}` },
      update: { methods: ['put', 'patch'], path: `${path}/:id` },
      delete: { methods: ['del'], path: `${path}/:id` }
    };

    let allActions = Object.keys(actionsMethodsAndsPathsMappings);
    let actions = only.length > 0 && only
                  || except.length > 0 && allActions.filter((action) => (except.indexOf(action) === -1))
                  || allActions;

    actions.forEach((action) => {
      let methodsWithPath = actionsMethodsAndsPathsMappings[action];

      methodsWithPath.methods.forEach((method) => {
        return path === resourceName
          ? this[method](methodsWithPath.path)
          : this[method](methodsWithPath.path, resourceName);
      });
    });
  }

  /**
   *
   * @private
   * @hide
   */
  _defineRouteHandlerHelpers() {
    [['get'], ['post'], ['put'], ['delete', 'del'], ['patch'], ['head'], ['options']].forEach(([verb, alias]) => {
      this[verb] = (path, ...args) => {
        let [ rawHandler, customizedCode, options ] = extractRouteArguments(args);
        return this._registerRouteHandler(verb, path, rawHandler, customizedCode, options);
      };

      if (alias) {
        this[alias] = this[verb];
      }
    });
  }

  _serialize(body) {
    if (typeof body === 'string') {
      return body;
    } else {
      return JSON.stringify(body);
    }
  }

  _registerRouteHandler(verb, path, rawHandler, customizedCode, options) {

    let routeHandler = new RouteHandler({
      schema: this.schema,
      verb, rawHandler, customizedCode, options, path,
      serializerOrRegistry: this.serializerOrRegistry
    });

    let fullPath = this._getFullPath(path);
    let timing = options.timing !== undefined ? options.timing : (() => this.timing);

    return this.pretender[verb](
      fullPath,
      (request) => {
        return new Promise(resolve => {
          Promise.resolve(routeHandler.handle(request)).then(mirageResponse => {
            let [ code, headers, response ] = mirageResponse;
            resolve([ code, headers, this._serialize(response) ]);
          });
        });
      },
      timing
    );
  }

  /**
   *
   * @private
   * @hide
   */
  _hasModulesOfType(modules, type) {
    let modulesOfType = modules[type];
    return modulesOfType ? Object.keys(modulesOfType).length > 0 : false;
  }

  /**
   * Builds a full path for Pretender to monitor based on the `path` and
   * configured options (`urlPrefix` and `namespace`).
   *
   * @private
   * @hide
   */
  _getFullPath(path) {
    path = path[0] === '/' ? path.slice(1) : path;
    let fullPath = '';
    let urlPrefix = this.urlPrefix ? this.urlPrefix.trim() : '';
    let namespace = '';

    // if there is a urlPrefix and a namespace
    if (this.urlPrefix && this.namespace) {
      if (this.namespace[0] === '/' && this.namespace[this.namespace.length - 1] === '/') {
        namespace = this.namespace.substring(0, this.namespace.length - 1).substring(1);
      }

      if (this.namespace[0] === '/' &&  this.namespace[this.namespace.length - 1] !== '/') {
        namespace = this.namespace.substring(1);
      }

      if (this.namespace[0] !== '/' &&  this.namespace[this.namespace.length - 1] === '/') {
        namespace = this.namespace.substring(0, this.namespace.length - 1);
      }

      if (this.namespace[0] !== '/' &&  this.namespace[this.namespace.length - 1] !== '/') {
        namespace = this.namespace;
      }
    }

    // if there is a namespace and no urlPrefix
    if (this.namespace && !this.urlPrefix) {
      if (this.namespace[0] === '/' && this.namespace[this.namespace.length - 1] === '/') {
        namespace = this.namespace.substring(0, this.namespace.length - 1);
      }

      if (this.namespace[0] === '/' &&  this.namespace[this.namespace.length - 1] !== '/') {
        namespace = this.namespace;
      }

      if (this.namespace[0] !== '/' &&  this.namespace[this.namespace.length - 1] === '/') {
        let namespaceSub = this.namespace.substring(0, this.namespace.length - 1);
        namespace = `/${namespaceSub}`;
      }

      if (this.namespace[0] !== '/' &&  this.namespace[this.namespace.length - 1] !== '/') {
        namespace = `/${this.namespace}`;
      }
    }

    // if no namespace
    if (!this.namespace) {
      namespace = '';
    }

    // check to see if path is a FQDN. if so, ignore any urlPrefix/namespace that was set
    if (/^https?:\/\//.test(path)) {
      fullPath += path;
    } else {
      // otherwise, if there is a urlPrefix, use that as the beginning of the path
      if (urlPrefix.length) {
        fullPath += (urlPrefix[urlPrefix.length - 1] === '/') ? urlPrefix : `${urlPrefix}/`;
      }

      // add the namespace to the path
      fullPath += namespace;

      // add a trailing slash to the path if it doesn't already contain one
      if (fullPath[fullPath.length - 1] !== '/') {
        fullPath += '/';
      }

      // finally add the configured path
      fullPath += path;

      // if we're making a same-origin request, ensure a / is prepended and
      // dedup any double slashes
      if (!/^https?:\/\//.test(fullPath)) {
        fullPath = `/${fullPath}`;
        fullPath = fullPath.replace(/\/+/g, '/');
      }
    }

    return fullPath;
  }

  /**
   *
   * @private
   * @hide
   */
  _configureDefaultPassthroughs() {
    defaultPassthroughs.forEach((passthroughUrl) => {
      this.passthrough(passthroughUrl);
    });
  }

  /**
   *
   * @private
   * @hide
   */
  _typeIsPluralForModel(typeOrCollectionName) {
    let modelOrFactoryExists = this._modelOrFactoryExistsForTypeOrCollectionName(typeOrCollectionName);
    let isPlural = typeOrCollectionName === pluralize(typeOrCollectionName);
    let isUncountable = singularize(typeOrCollectionName) === pluralize(typeOrCollectionName);

    return isPlural && !isUncountable && modelOrFactoryExists;
  }

  /**
   *
   * @private
   * @hide
   */
  _modelOrFactoryExistsForTypeOrCollectionName(typeOrCollectionName) {
    // Need this, since singular or plural can be passed in. Can assume singular (type) in 1.0.
    let type = singularize(typeOrCollectionName);

    let modelExists = (this.schema && this.schema.modelFor(camelize(type)));
    let dbCollectionExists = this.db[toInternalCollectionName(type)];

    return modelExists || dbCollectionExists;
  }

  /**
   *
   * @private
   * @hide
   */
  _validateTraits(traits, factory, type) {
    traits.forEach((traitName) => {
      if (!factory.isTrait(traitName)) {
        throw new Error(`'${traitName}' trait is not registered in '${type}' factory`);
      }
    });
  }

  /**
   *
   * @private
   * @hide
   */
  _mergeExtensions(attrs, traits, overrides) {
    let allExtensions = traits.map((traitName) => {
      return attrs[traitName].extension;
    });
    allExtensions.push(overrides || {});
    return allExtensions.reduce((accum, extension) => {
      return _assign(accum, extension);
    }, {});
  }

  /**
   *
   * @private
   * @hide
   */
  _mapAssociationsFromAttributes(modelName, attributes, overrides = {}) {
    Object.keys(attributes || {}).filter((attr) => {
      return isAssociation(attributes[attr]);
    }).forEach((attr) => {
      let modelClass = this.schema.modelClassFor(modelName);
      let association = modelClass.associationFor(attr);

      assert(association && association instanceof BelongsTo,
        `You're using the \`association\` factory helper on the '${attr}' attribute of your ${modelName} factory, but that attribute is not a \`belongsTo\` association. Read the Factories docs for more information: http://www.ember-cli-mirage.com/docs/v0.3.x/factories/#factories-and-relationships`
      );

      let isSelfReferentialBelongsTo = association && association instanceof BelongsTo && association.modelName === modelName;

      assert(!isSelfReferentialBelongsTo, `You're using the association() helper on your ${modelName} factory for ${attr}, which is a belongsTo self-referential relationship. You can't do this as it will lead to infinite recursion. You can move the helper inside of a trait and use it selectively.`);

      let factoryAssociation = attributes[attr];
      let foreignKey = `${camelize(attr)}Id`;
      if (!overrides[attr]) {
        attributes[foreignKey] = this.create(association.modelName, ...factoryAssociation.traitsAndOverrides).id;
      }
      delete attributes[attr];
    });
  }
}
