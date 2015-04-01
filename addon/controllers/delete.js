import { pluralize, singularize } from '../utils/inflector';
import BaseController from './base';

/*
  Shorthands for DELETE requests.
*/
export default BaseController.extend({

  /*
    Remove the model from the db of type *type*.

    This would remove the user with id :id:
      Ex: this.stub('delete', '/contacts/:id', 'user');
  */
  stringHandler: function(type, db, request) {
    var id = this._getIdForRequest(request);
    var collection = pluralize(type);

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    db[collection].remove(id);
    
    return undefined;
  },

  /*
    Remove the model and child related models from the db.

    This would remove the contact with id `:id`, and well
    as this contact's addresses and phone numbers.
      Ex: this.stub('delete', '/contacts/:id', ['contact', 'addresses', 'numbers');
  */
  arrayHandler: function(array, db, request) {
    var id = this._getIdForRequest(request);
    var parentType = array[0];
    var parentCollection = pluralize(parentType);
    var types = array.slice(1);

    if (!db[parentCollection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + parentCollection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    db[parentCollection].remove(id);

    var query = {};
    var parentIdKey = parentType + '_id';
    query[parentIdKey] = id;

    types.forEach(function(type) {
      var collection = pluralize(type);

      if (!db[parentCollection]) {
        console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
      }

      db[collection].remove(query);
    });

    return undefined;
  },

  /*
    Remove the model from the db based on singular version
    of the last portion of the url.

    This would remove contact with id :id:
      Ex: this.stub('delete', '/contacts/:id');
  */
  undefinedHandler: function(undef, db, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var urlNoId = id ? url.substr(0, url.lastIndexOf('/')) : url;
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));
    var collection = pluralize(type);

    db[collection].remove(id);
    
    return undefined;
  },
});
