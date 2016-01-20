import assert from 'ember-cli-mirage/assert';
import BaseShorthandRouteHandler from './base';
import { camelize } from 'ember-cli-mirage/utils/inflector';

export default class PutShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Update an object from the db, specifying the type.

      this.put('/contacts/:id', 'user');
  */
  handleStringShorthand(request, modelName) {
    let id = this._getIdForRequest(request);
    let type = camelize(modelName);
    let attrs = this._getAttrsForRequest(request, modelName);
    let modelClass = this.schema[type];

    assert(
      modelClass,
      `The route handler for ${request.url} is trying to access the ${type} model, but that model doesn't exist. Create it using 'ember g mirage-model ${modelName}'.`
    );

    return modelClass.find(id).update(attrs);
  }

}
