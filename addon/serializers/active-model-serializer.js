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

  normalize(payload) {
    // let payload = {contact: {id: 1, name: "Linkz0r"}};
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
    Object.keys(attrs).forEach(key => {
      if (key !== 'id') {
        jsonApiPayload.data.attributes[key] = attrs[key];
      }
    });

    return jsonApiPayload;
  }

});
