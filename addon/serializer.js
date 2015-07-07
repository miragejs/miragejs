import Model from './orm/model';
import Collection from './orm/collection';
import { pluralize } from './utils/inflector';
// import utils from './shorthands/utils';

// const isArray = _.isArray;

export default class Serializer {

  serialize(response, request) {
    let serializedResponse;

    if (response instanceof Model || response instanceof Collection) {
      // let id = utils.getIdForRequest(request);
      // let url = utils.getUrlForRequest(request);
      // let type = utils.getTypeFromUrl(url, id);

      if (response instanceof Collection) {
        serializedResponse = this.serializeCollection(response);

      } else if (response instanceof Model) {
        serializedResponse = this.serializeModel(response);
      }

    // } else if (isArray(response) {
    //   var key = pluralize(type);
    //   serializedResponse[key] = response.map(model => model.attrs);


    } else {
      serializedResponse = response;
    }

    return serializedResponse;
  }

  serializeModel(model) {
    return { [model.type]: model.attrs };
  }

  serializeCollection(collection) {
    let key = pluralize(collection[0].type);
    let allAttrs = collection.map(model => model.attrs);

    return { [key]: allAttrs };
  }

}
