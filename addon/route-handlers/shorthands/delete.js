import assert from 'ember-cli-mirage/assert';
import BaseShorthandRouteHandler from './base';
import { pluralize, camelize } from 'ember-cli-mirage/utils/inflector';

export default class DeleteShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Remove the model from the db of type *type*.

    This would remove the user with id :id:
      Ex: this.del('/contacts/:id', 'user');
  */
  handleStringShorthand(request, modelName) {
    let id = this._getIdForRequest(request);
    let type = camelize(modelName);
    let modelClass = this.schema[type];

    assert(
      modelClass,
      `The route handler for ${request.url} is trying to access the ${type} model, but that model doesn't exist. Create it using 'ember g mirage-model ${modelName}'.`
    );

    return modelClass.find(id).destroy();
  }

  /*
    Remove the model and child related models from the db.

    This would remove the contact with id `:id`, and well
    as this contact's addresses and phone numbers.
      Ex: this.del('/contacts/:id', ['contact', 'addresses', 'numbers');
  */
  handleArrayShorthand(request, array) {
    let id = this._getIdForRequest(request);
    let parentType = camelize(array[0]);
    let childTypes = array.slice(1).map(camelize);
    let parent = this.schema[parentType].find(id);

    // Delete related children
    childTypes.forEach(type => {
      parent[pluralize(type)].destroy();
    });

    // Delete the parent
    parent.destroy();
  }

}
