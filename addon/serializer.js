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
    return this.constructor.root ? { [model.type]: model.attrs } : model.attrs;
  }

  serializeCollection(collection) {
    let key = pluralize(collection[0].type);
    let allAttrs = collection.map(model => model.attrs);

    return this.constructor.root ? { [key]: allAttrs } : allAttrs;
  }

}

Serializer.extend = extend.bind(Serializer, null);

Serializer.root = true;

export default Serializer;
