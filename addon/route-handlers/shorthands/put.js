import MirageError from 'ember-cli-mirage/error';
import BaseShorthandRouteHandler from './base';
import { camelize } from 'ember-cli-mirage/utils/inflector';

export default class PutShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Update an object from the db, specifying the type.

      this.put('/contacts/:id', 'user');
  */
  handleStringShorthand(modelName, schema, request) {
    let id = this._getIdForRequest(request);
    let type = camelize(modelName);
    let attrs = this._getAttrsForRequest(request);

    if (!schema[type]) {
      throw new MirageError(`The route handler for ${request.url} is trying to access the ${type} model, but that model doesn't exist. Create it using 'ember g mirage-model ${modelName}'.`);
    }

    return schema[type].find(id).update(attrs);
  }

}
