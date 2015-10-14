import BaseShorthandRouteHandler from './base';
import { pluralize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

export default class PostShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Push a new model of type *type* to the db.

    For example, this will push a 'user':
      this.stub('post', '/contacts', 'contact');
  */
  handleStringShorthand(string, dbOrSchema, request) {
    let type = string;
    let collection = pluralize(string);

    if (dbOrSchema instanceof Db) {
      let payload = this._getJsonBodyForRequest(request);
      let attrs = payload[type];
      let db = dbOrSchema;
      if (!db[collection]) {
        console.error("Mirage: The route handler for " + request.url + " is trying to insert data into the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
      }

      let model = db[collection].insert(attrs);

      let response = {};
      response[type] = model;

      return response;

    } else {
      let attrs = this._getAttrsForRequest(request);
      let schema = dbOrSchema;
      let model = schema[type].create(attrs);

      return model;
    }
  }

  /*
    Push a new model to the db. The type is found
    by singularizing the last portion of the URL.

    For example, this will push a 'contact'.
      this.stub('post', '/contacts');
  */
  handleUndefinedShorthand(undef, dbOrSchema, request) {
    let url = this._getUrlForRequest(request);
    let type = this._getTypeFromUrl(url);

    return this.handleStringShorthand(type, dbOrSchema, request);
  }


}
