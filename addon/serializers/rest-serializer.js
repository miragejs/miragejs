import ActiveModelSerializer from './active-model-serializer';
import { camelize, pluralize } from '../utils/inflector';

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

  keyForRelationshipIds(type) {
    return `${camelize(type)}Ids`;
  }
});
