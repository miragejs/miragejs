import { singularize, pluralize } from 'inflected';
import Db from './db';
import Association from './orm/associations/association';
import BaseRouteHandler from './route-handlers/base';
import Serializer from './serializer';
import Schema from './orm/schema';

const classes = {
  Db,
  Association,
  BaseRouteHandler,
  Serializer,
  Schema
};

/**
  Lightweight DI container for customizable objects that are needed by
  deeply nested classes.
*/
class Container {

  constructor() {
    this.inflector = { singularize, pluralize };
  }

  create(className, ...args) {
    let Klass = classes[className];
    return new Klass(...args);
  }

}

/**
  These are side effects. We give each class a default container so it can be
  easily unit tested.

  We should remove these once we have test coverage and can refactor to a proper
  DI system.
*/
let defaultContainer = new Container();

Db.prototype._container = defaultContainer;
Association.prototype._container = defaultContainer;
BaseRouteHandler.prototype._container = defaultContainer;
Serializer.prototype._container = defaultContainer;
Schema.prototype._container = defaultContainer;

export default Container;
