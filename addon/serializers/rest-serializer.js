import ActiveModelSerializer from './active-model-serializer';
import { camelize, singularize, pluralize } from '../utils/inflector';

export default ActiveModelSerializer.extend({

  keyForModel(type) {
    return camelize(type);
  },

  keyForAttribute(attr) {
    return camelize(attr);
  },

  keyForRelationship(type) {
    return camelize(pluralize(type));
  },

  keyForEmbeddedRelationship(attributeName) {
    return camelize(attributeName);
  },

  keyForRelationshipIds(type) {
    return `${camelize(singularize(type))}Ids`;
  }
});
