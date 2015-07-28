import Model from './orm/model';
import Collection from './orm/collection';
import { pluralize } from './utils/inflector';
import extend from './utils/extend';

class Serializer {

  serialize(response, request) {
    if (response instanceof Model) {
      return this.serializeModel(response);

    } else if (response instanceof Collection) {
      return this.serializeCollection(response);

    } else {
      return response;
    }
  }

  serializeModel(model) {
    let attrs = this._attrsForModel(model);

    return this.root ? { [model.type]: attrs } : attrs;
  }

  serializeCollection(collection) {
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
      attrs = model.attrs;
    }

    return attrs;
  }
}

Serializer.extend = extend;

export default Serializer;
