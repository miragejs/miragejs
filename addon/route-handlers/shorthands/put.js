import BaseShorthandRouteHandler from './base';
import { pluralize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

export default class PutShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Update an object from the db, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  handleStringShorthand(type, dbOrSchema, request) {
    var id = this._getIdForRequest(request);
    var collection = pluralize(type);

    if (dbOrSchema instanceof Db) {
      let payload = this._getJsonBodyForRequest(request);
      let attrs = payload[type];
      let db = dbOrSchema;
      if (!db[collection]) {
        console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
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

  /*
    Update an object from the db based on singular version
    of the last portion of the url.

      this.stub('put', '/contacts/:id');
  */
  handleUndefinedShorthand(undef, dbOrSchema, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var type = this._getTypeFromUrl(url, id);

    return this.handleStringShorthand(type, dbOrSchema, request);
  }

}
