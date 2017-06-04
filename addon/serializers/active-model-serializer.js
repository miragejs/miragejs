import Serializer from '../serializer';
import { underscore, pluralize, dasherize, singularize } from '../utils/inflector';

export default Serializer.extend({

  keyForModel(type) {
    return underscore(type);
  },

  keyForAttribute(attr) {
    return underscore(attr);
  },

  keyForRelationship(type) {
    return pluralize(underscore(type));
  },

  keyForEmbeddedRelationship(attributeName) {
    return underscore(attributeName);
  },

  keyForRelationshipIds(type) {
    return `${underscore(singularize(type))}_ids`;
  },

  keyForForeignKey(relationshipName) {
    return `${underscore(relationshipName)}_id`;
  },

  keyForPolymorphicForeignKeyId(relationshipName) {
    return `${underscore(relationshipName)}_id`;
  },

  keyForPolymorphicForeignKeyType(relationshipName) {
    return `${underscore(relationshipName)}_type`;
  },

  normalize(payload) {
    let type = Object.keys(payload)[0];
    let attrs = payload[type];

    let jsonApiPayload = {
      data: {
        type: pluralize(type),
        attributes: {}
      }
    };
    if (attrs.id) {
      jsonApiPayload.data.id = attrs.id;
    }
    Object.keys(attrs).forEach((key) => {
      if (key !== 'id') {
        jsonApiPayload.data.attributes[dasherize(key)] = attrs[key];
      }
    });

    return jsonApiPayload;
  }

});
