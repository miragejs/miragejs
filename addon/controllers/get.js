import { singularize, pluralize } from '../inflector';
import BaseController from './base';

/*
  Shorthands for GET requests.
*/
export default BaseController.extend({

  /*
    Retrieve *key* from the store. If it's singular,
    retrieve a single model by id.

    Examples:
      this.stub('get', '/contacts', 'contacts');
      this.stub('get', '/contacts/:id', 'contact');
  */
  stringHandler: function(string, store, request) {
    var key = string;
    var data = {};
    var id = this._getIdForRequest(request);

    // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
    if (id) {
      var model = store.find(key, id);
      data[key] = model;

    } else {
      data[key] = store.findAll(key);
    }

    return data;
  },

  /*
    Retrieve *keys* from the store.

    If all keys plural, retrieve all objects from store.
      Ex: this.stub('get', '/contacts', ['contacts', 'pictures']);


    If first is singular, find first by id, and filter all
    subsequent models by related.
      Ex: this.stub('get', '/contacts/:id', ['contact', 'addresses']);
  */
  arrayHandler: function(keys, store, request) {
    var _this = this;
    var data = {};
    var owner;
    var ownerKey;

    keys.forEach(function(key) {

      // There's an owner. Find only related.
      if (ownerKey) {
        var ownerIdKey = singularize(ownerKey) + '_id';
        var query = {};
        query[ownerIdKey] = owner.id;
        data[key] = store.findQuery(key, query);

      } else {

        // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
        if (singularize(key) === key) {
          ownerKey = key;
          var id = _this._getIdForRequest(request);
          var model = store.find(key, id);
          data[key] = model;
          owner = model;

        } else {
          data[key] = store.findAll(key);
        }
      }
    });

    return data;
  },

  /*
    Retrieve objects from the store based on singular version
    of the last portion of the url.

    This would return all contacts:
      Ex: this.stub('get', '/contacts');

    If an id is present, return a single model by id.
      Ex: this.stub('get', '/contacts/:id');
  */
  undefinedHandler: function(undef, store, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var urlNoId = id ? url.substr(0, url.lastIndexOf('/')) : url;
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));
    var key = pluralize(type);
    var data = {};

    if (id) {
      data[type] = store.find(type, id);
    } else {
      data[key] = store.findAll(type);
    }

    return data;
  },

  // Private methods
  _getIdForRequest: function(request) {
    var id;
    if (request && request.params && request.params.id) {
      id = request.params.id;
    }

    return id;
  },

  _getUrlForRequest: function(request) {
    var url;
    if (request && request.url) {
      url = request.url;
    }

    return url;
  }

});
