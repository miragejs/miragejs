import BaseShorthandRouteHandler from './base';
import { pluralize, camelize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

export default class PutShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Update an object from the db, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  handleStringShorthand(string, dbOrSchema, request) {
    var id = this._getIdForRequest(request);
    let type = camelize(string);
    var collection = pluralize(type);

    if (dbOrSchema instanceof Db) {
      let payload = this._getJsonBodyForRequest(request);
      let attrs = payload[type];
      let db = dbOrSchema;
      if (!db[collection]) {
        throw new Error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
      }

      var data = db[collection].update(id, attrs);

      var response = {};
      response[type] = data;

      return response;

    } else {
      let attrs = this._getAttrsForRequest(request);
      let schema = dbOrSchema;

      return schema[type].find(id).update(attrs);
    }
  }

}
