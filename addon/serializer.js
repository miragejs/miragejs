/* global _ */
import Model from './orm/model';
import Collection from './orm/collection';
import { pluralize } from './utils/inflector';
import extend from './utils/extend';

class Serializer {

  serialize(response, request) {
    if (response instanceof Model) {
      return this._serializeModel(response);

    } else if (response instanceof Collection) {
      return this._serializeCollection(response);

    } else {
      return response;
    }
  }

  keyForAttribute(key) {
    return key;
  }

  _serializeModel(model) {
    let attrs = this._attrsForModel(model);

    return this.root ? { [model.type]: attrs } : attrs;
  }

  _serializeCollection(collection) {
    let key = pluralize(collection[0].type);
    let allAttrs = collection.map(model => this._attrsForModel(model));

    return this.root ? { [key]: allAttrs } : allAttrs;
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

Serializer.extend = extend;

export default Serializer;
