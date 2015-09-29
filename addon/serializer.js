/* global _ */
import Model from './orm/model';
import extend from './utils/extend';
import { singularize, pluralize } from './utils/inflector';

class Serializer {

  serialize(response, request) {
    if (response instanceof Model) {
      return this._attrsForModel(response);

    } else {
      return response;
    }
  }

  keyForAttribute(attr) {
    return attr;
  }

  keyForRelatedCollection(type) {
    return pluralize(type);
  }

  keyForRelationshipIds(type) {
    return `${singularize(type)}Ids`;
  }

  normalize(json) {
    return json;
  }

  _attrsForModel(model) {
    let attrs = {};

    if (this.attrs) {
      attrs = this.attrs.reduce((memo, attr) => {
        memo[attr] = model[attr];
        return memo;
      }, {});
    } else {
      attrs = _.assign(attrs, model.attrs);
    }

    return this._formatAttributeKeys(attrs);
  }

  _formatAttributeKeys(attrs) {
    let formattedAttrs = {};

    for (let key in attrs) {
      let formattedKey = this.keyForAttribute(key);
      formattedAttrs[formattedKey] = attrs[key];
    }

    return formattedAttrs;
  }
}

// Defaults
Serializer.prototype.relationships = [];
Serializer.prototype.root = true;
Serializer.prototype.embed = false;

Serializer.extend = extend;

export default Serializer;
