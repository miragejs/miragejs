import BaseShorthandRouteHandler from './base';
import { pluralize, singularize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

export default class DeleteShorthandRouteHandler extends BaseShorthandRouteHandler {

  /*
    Remove the model from the db of type *type*.

    This would remove the user with id :id:
      Ex: this.stub('delete', '/contacts/:id', 'user');
  */
  handleStringShorthand(type, dbOrSchema, request) {
    var id = this._getIdForRequest(request);
    var collection = pluralize(type);

    if (dbOrSchema instanceof Db) {
      let db = dbOrSchema;
      if (!db[collection]) {
        console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
      }

      db[collection].remove(id);

    } else {
      let schema = dbOrSchema;

      return schema[type].find(id).destroy();
    }

    return undefined;
  }

  /*
    Remove the model and child related models from the db.

    This would remove the contact with id `:id`, and well
    as this contact's addresses and phone numbers.
      Ex: this.stub('delete', '/contacts/:id', ['contact', 'addresses', 'numbers');
  */
  handleArrayShorthand(array, dbOrSchema, request) {
    var id = this._getIdForRequest(request);
    var parentType = array[0];
    var parentCollection = pluralize(parentType);
    var types = array.slice(1);

    if (dbOrSchema instanceof Db) {
      let db = dbOrSchema;
      if (!db[parentCollection]) {
        console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + parentCollection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
      }

      db[parentCollection].remove(id);

      var query = {};
      var parentIdKey = parentType + '_id';
      query[parentIdKey] = id;

      types.forEach(function(type) {
        var collection = pluralize(type);

        if (!db[collection]) {
          console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
        }

        db[collection].remove(query);
      });

    } else {
      let schema = dbOrSchema;

      let parent = schema[parentType].find(id);

      // Delete related children
      types.forEach(type => {
        parent[type].destroy();
      });

      // Delete the parent
      parent.destroy();
    }

    return undefined;
  }

  /*
    Remove the model from the db based on singular version
    of the last portion of the url.

    This would remove contact with id :id:
      Ex: this.stub('delete', '/contacts/:id');
  */
  handleUndefinedShorthand(undef, dbOrSchema, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var urlNoId = id ? url.substr(0, url.lastIndexOf('/')) : url;
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));

    return this.handleStringShorthand(type, dbOrSchema, request);
  }
}
