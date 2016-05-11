import Factory from './factory';
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

function hasMany(...args) {
  return new HasMany(...args);
}
function belongsTo(...args) {
  return new BelongsTo(...args);
}

export {
  Factory,
  Response,
  faker,
  Model,
  Collection,
  Serializer,
  ActiveModelSerializer,
  JSONAPISerializer,
  RestSerializer,
  hasMany,
  belongsTo
};

export default {
  Factory,
  Response,
  hasMany,
  belongsTo
};
