import Factory from './factory';
import trait from './trait';
import association from './association';
import Response from './response';
import Model from './orm/model';
import Collection from './orm/collection';
import Serializer from './serializer';
import ActiveModelSerializer from './serializers/active-model-serializer';
import JSONAPISerializer from './serializers/json-api-serializer';
import RestSerializer from './serializers/rest-serializer';
import HasMany from './orm/associations/has-many';
import BelongsTo from './orm/associations/belongs-to';
import IdentityManager from './identity-manager';
import { configureInflector, clearInflector } from './utils/inflector';

/**
  @hide
*/
function hasMany(...args) {
  return new HasMany(...args);
}

/**
  @hide
*/
function belongsTo(...args) {
  return new BelongsTo(...args);
}

const Inflector = { configureInflector, clearInflector };

export {
  Factory,
  trait,
  association,
  Response,
  Model,
  Collection,
  Serializer,
  ActiveModelSerializer,
  JSONAPISerializer,
  RestSerializer,
  hasMany,
  belongsTo,
  IdentityManager,
  Inflector
};

export { default, default as Server, defaultPassthroughs } from './server';
