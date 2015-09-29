import Serializer from '../serializer';
import { decamelize, pluralize } from '../utils/inflector';

export default Serializer.extend({

  keyForAttribute(attr) {
    return decamelize(attr);
  },

  keyForRelatedCollection(type) {
    return pluralize(decamelize(type));
  },

  keyForRelationshipIds(type) {
    return `${decamelize(type)}_ids`;
  },

  normalize(json) {
    return json;
  }

});
