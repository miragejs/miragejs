import Response from '../response';
import { singularize, pluralize } from '../utils/inflector';
import utils from './utils';


/*
  Retrieve *key* from the db. If it's singular,
  retrieve a single model by id.

  Examples:
    this.stub('get', '/contacts', 'contacts');
    this.stub('get', '/contacts/:id', 'contact');
*/
function stringGet(string, db, request, options) {
  var key = string;
  var collection = pluralize(string);
  var id = utils.getIdForRequest(request);
  var data = {};
  var record;
  options = options || {};

  if (!db[collection]) {
    console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
  }

  if (id) {
    record = db[collection].find(id);
    if (!record) {
      return new Response(404, {}, {});
    }
    data[key] = record;
  } else if (options.coalesce && request.queryParams && request.queryParams.ids) {
    data[key] = db[collection].find(request.queryParams.ids);
  } else {
    data[key] = db[collection];
  }
  return data;
}

/*
  Retrieve *keys* from the db.

  If all keys plural, retrieve all objects from db.
    Ex: this.stub('get', '/contacts', ['contacts', 'pictures']);


  If first is singular, find first by id, and filter all
  subsequent models by related.
    Ex: this.stub('get', '/contacts/:id', ['contact', 'addresses']);
*/
function arrayGet(array, db, request) {
  var keys = array;
  var data = {};
  var owner;
  var ownerKey;

  keys.forEach(function(key) {
    var collection = pluralize(key);

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    // There's an owner. Find only related.
    if (ownerKey) {
      var ownerIdKey = singularize(ownerKey) + '_id';
      var query = {};
      query[ownerIdKey] = owner.id;
      data[key] = db[collection].where(query);

    } else {

      // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
      if (singularize(key) === key) {
        ownerKey = key;
        var id = utils.getIdForRequest(request);
        var model = db[collection].find(id);
        data[key] = model;
        owner = model;

      } else {
        data[key] = db[collection];
      }
    }
  });

  return data;
}

/*
  Retrieve objects from the db based on singular version
  of the last portion of the url.

  This would return all contacts:
    Ex: this.stub('get', '/contacts');

  If an id is present, return a single model by id.
    Ex: this.stub('get', '/contacts/:id');

  If the options contain a `coalesce: true` option and the queryParams have `ids`, it
  returns the models with those ids.
    Ex: this.stub('get', '/contacts/:id');
*/
function undefinedGet(undef, db, request, options) {
  var id = utils.getIdForRequest(request);
  var url = utils.getUrlForRequest(request);
  var type = utils.getTypeFromUrl(url, id);
  var str = id ? type : pluralize(type);
  return stringGet(str, db, request, options);
}

export default {
  string: stringGet,
  array: arrayGet,
  undefined: undefinedGet
};
