import { singularize, pluralize } from '../utils/inflector';
import BaseController from './base';

/*
  Shorthands for GET requests.
*/
export default BaseController.extend({

  /*
    Retrieve *key* from the db. If it's singular,
    retrieve a single model by id.

    Examples:
      this.stub('get', '/contacts', 'contacts');
      this.stub('get', '/contacts/:id', 'contact');
  */
  stringHandler: function(string, db, request) {
    var key = string;
    var collection = pluralize(string);
    var data = {};
    var id = this._getIdForRequest(request);

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
    if (id) {
      var model = db[collection].find(id);
      data[key] = model;

    } else {
      data[key] = db[collection];
    }

    return data;
  },

  /*
    Retrieve *keys* from the db.

    If all keys plural, retrieve all objects from db.
      Ex: this.stub('get', '/contacts', ['contacts', 'pictures']);


    If first is singular, find first by id, and filter all
    subsequent models by related.
      Ex: this.stub('get', '/contacts/:id', ['contact', 'addresses']);
  */
  arrayHandler: function(array, db, request) {
    var _this = this;
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
          var id = _this._getIdForRequest(request);
          var model = db[collection].find(id);
          data[key] = model;
          owner = model;

        } else {
          data[key] = db[collection];
        }
      }
    });

    return data;
  },

  /*
    Retrieve objects from the db based on singular version
    of the last portion of the url.

    This would return all contacts:
      Ex: this.stub('get', '/contacts');

    If an id is present, return a single model by id.
      Ex: this.stub('get', '/contacts/:id');
  */
  undefinedHandler: function(undef, db, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var type = this._getTypeFromUrl(url, id);
    var collection = pluralize(type);
    var data = {};

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    if (id) {
      data[type] = db[collection].find(id);
    } else {
      data[collection] = db[collection];
    }

    return data;
  }

});
