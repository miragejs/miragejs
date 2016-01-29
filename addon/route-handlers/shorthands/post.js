import assert from 'ember-cli-mirage/assert';
import BaseShorthandRouteHandler from './base';
import { camelize } from 'ember-cli-mirage/utils/inflector';

export default class PostShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Push a new model of type *camelizedModelName* to the db.

    For example, this will push a 'user':
      this.post('/contacts', 'user');
  */
  handleStringShorthand(request, modelName) {
    let camelizedModelName = camelize(modelName);
    let attrs = this._getAttrsForRequest(request, modelName);
    let modelClass = this.schema[camelizedModelName];

    assert(
      modelClass,
      `The route handler for ${request.url} is trying to access the ${camelizedModelName} model, but that model doesn't exist. Create it using 'ember g mirage-model ${modelName}'.`
    );

    return modelClass.create(attrs);
  }

}
