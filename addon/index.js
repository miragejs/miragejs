import assert from './assert';
import Factory from './factory';
import trait from './trait';
import association from './association';
import Response from './response';
import faker from './faker';
import Model from './orm/model';
import Collection from './orm/collection';
import Serializer from './serializer';
import ActiveModelSerializer from './serializers/active-model-serializer';
import JSONAPISerializer from './serializers/json-api-serializer';
import RestSerializer from './serializers/rest-serializer';
import HasMany from './orm/associations/has-many';
import BelongsTo from './orm/associations/belongs-to';
import { getModels } from './ember-data';

function hasMany(...args) {
  return new HasMany(...args);
}
function belongsTo(...args) {
  return new BelongsTo(...args);
}

function modelFor(name) {
  let models = getModels();
  assert(!!models[name], `Model of type '${name}' does not exist.`);
  return models[name];
}

export {
  Factory,
  trait,
  association,
  Response,
  faker,
  Model,
  Collection,
  Serializer,
  ActiveModelSerializer,
  JSONAPISerializer,
  RestSerializer,
  hasMany,
  belongsTo,
  modelFor
};

export default {
  Factory,
  Response,
  hasMany,
  belongsTo
};
