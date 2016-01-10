import assert from 'ember-cli-mirage/assert';
import BaseShorthandRouteHandler from './base';
import { camelize } from 'ember-cli-mirage/utils/inflector';

export default class PostShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Push a new model of type *type* to the db.

    For example, this will push a 'user':
      this.post('/contacts', 'user');
  */
  handleStringShorthand(modelName, schema, request) {
    let type = camelize(modelName);
    let attrs = this._getAttrsForRequest(request);
    let modelClass = schema[type];

    assert(
      modelClass,
      `The route handler for ${request.url} is trying to access the ${type} model, but that model doesn't exist. Create it using 'ember g mirage-model ${modelName}'.`
    );

    return modelClass.create(attrs);
  }

}
