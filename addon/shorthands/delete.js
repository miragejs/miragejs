import { pluralize, singularize } from '../utils/inflector';
import utils from './utils';
import Db from '../db';

/*
  Remove the model from the db of type *type*.

  This would remove the user with id :id:
    Ex: this.stub('delete', '/contacts/:id', 'user');
*/
function stringDel(type, dbOrSchema, request) {
  var id = utils.getIdForRequest(request);
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
function arrayDel(array, dbOrSchema, request) {
  var id = utils.getIdForRequest(request);
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

      if (!db[parentCollection]) {
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
function undefinedDel(undef, dbOrSchema, request) {
  var id = utils.getIdForRequest(request);
  var url = utils.getUrlForRequest(request);
  var urlNoId = id ? url.substr(0, url.lastIndexOf('/')) : url;
  var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));

  return stringDel(type, dbOrSchema, request);
}

export default {
  undefined: undefinedDel,
  string: stringDel,
  array: arrayDel
};
