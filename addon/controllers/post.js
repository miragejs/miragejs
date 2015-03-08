import { pluralize, singularize } from '../utils/inflector';
import BaseController from './base';

/*
  Shorthands for POST requests.
*/
export default BaseController.extend({

  /*
    Push a new model of type *type* to the db.

    For example, this will push a 'user':
      this.stub('post', '/contacts', 'contact');
  */
  stringHandler: function(string, db, request) {
    var type = string;
    var collection = pluralize(string);
    var postData = this._getJsonBodyForRequest(request);
    var attrs = postData[type];

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to insert data into the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var model = db[collection].insert(attrs);

    var response = {};
    response[type] = model;

    return response;
  },

  /*
    Push a new model to the db. The type is found
    by singularizing the last portion of the URL.

    For example, this will push a 'contact'.
      this.stub('post', '/contacts');
  */
  undefinedHandler: function(undef, db, request) {
    var url = this._getUrlForRequest(request);
    var type = singularize(url.substr(url.lastIndexOf('/') + 1));
    var collection = pluralize(type);
    var postData = this._getJsonBodyForRequest(request);
    var attrs = postData[type];

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to insert data into the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var model = db[collection].insert(attrs);

    var response = {};
    response[type] = model;
    return response;
  }

});
