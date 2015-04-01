import { pluralize } from '../utils/inflector';
import BaseController from './base';

/*
  Shorthands for PUT requests.
*/
export default BaseController.extend({

  /*
    Update an object from the db, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  stringHandler: function(type, db, request) {
    var id = this._getIdForRequest(request);
    var putData = this._getJsonBodyForRequest(request);
    var attrs = putData[type];
    var collection = pluralize(type);
    attrs.id = id;

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var data = db[collection].update(id, attrs);

    return data;
  },

  /*
    Update an object from the db based on singular version
    of the last portion of the url.

      this.stub('put', '/contacts/:id');
  */
  undefinedHandler: function(undef, db, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var type = this._getTypeFromUrl(url, id);
    var collection = pluralize(type);
    var putData = this._getJsonBodyForRequest(request);
    var attrs = putData[type];

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var data = db[collection].update(id, attrs);

    return data;
  }

});
