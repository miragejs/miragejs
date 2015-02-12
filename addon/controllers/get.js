import { singularize } from '../inflector';
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

    // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
    if (singularize(key) === key) {
      var id = request.params.id;
      if (!id) { console.error("Pretenderify: You're trying to find a model by id, but no :id param was found in this route's URL."); return;}
      var model = store.find(key, request.params.id);
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
    var data = {};
    var owner;
    var ownerKey;

    keys.forEach(function(key) {

      // There's an owner. Find only related.
      if (ownerKey) {
        var ownerIdKey = singularize(ownerKey) + '_id';
        var query = {};
        query[ownerIdKey] = owner.id;
        data[key] = store.find(key, query);

      } else {

        // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
        if (singularize(key) === key) {
          ownerKey = key;
          var model = store.find(key, request.params.id);
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
    var id = request.params.id;
    var url = request.url;
    var urlNoId = id ? url.substr(0, url.lastIndexOf('/')) : url;
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));
    var data = {};

    data[type] = id ? store.find(type, id) : store.findAll(type);

    return data;
  }

});
