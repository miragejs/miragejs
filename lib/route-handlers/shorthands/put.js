import assert from "../../assert";
import BaseShorthandRouteHandler from "./base";
import { camelize } from "../../utils/inflector";

/**
 * @hide
 */
export default class PutShorthandRouteHandler extends BaseShorthandRouteHandler {
  /*
    Update an object from the db, specifying the type.

      this.put('/contacts/:id', 'user');
  */
  handleStringShorthand(request, modelClass) {
    let modelName = this.shorthand;
    let camelizedModelName = camelize(modelName);

    assert(
      modelClass,
      `The route handler for ${request.url} is trying to access the ${camelizedModelName} model, but that model doesn't exist.`
    );

    let id = this._getIdForRequest(request);
    let attrs = this._getAttrsForRequest(
      request,
      modelClass.camelizedModelName
    );

    return modelClass.find(id).update(attrs);
  }
}
