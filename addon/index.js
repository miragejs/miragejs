import Factory from './factory';
import Response from './response';
import faker from './faker';
import Model from './orm/model';
import Serializer from './serializer';
import ActiveModelSerializer from './serializers/active-model-serializer';
import JSONAPISerializer from './serializers/json-api-serializer';
import HasMany from './orm/associations/has-many';
import BelongsTo from './orm/associations/belongs-to';

function hasMany(modelName) {
  return new HasMany(modelName);
}
function belongsTo(modelName) {
  return new BelongsTo(modelName);
}

export {
  Factory,
  Response,
  faker,
  Model,
  Serializer,
  ActiveModelSerializer,
  JSONAPISerializer,
  hasMany,
  belongsTo
};

export default {
  Factory,
  Response,
  hasMany,
  belongsTo
};
