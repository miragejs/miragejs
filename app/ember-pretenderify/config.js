import Pretender from 'pretender';
import userConfig from '../pretender/config';
import userData from '../pretender/data/index';

var setupData = function() {
  this.originalData = userData;

  this.data = userData;
}

var defaults = function() {
  var _this = this;

  this.data = this.data || {};

  this.store = {
    find: function(key, id) {
      var data;
      var query;

      if (typeof id === 'object') {
        query = id;

        data = _this.data[key];
        Object.keys(query).forEach(function(queryKey) {
          data = data.filterBy(queryKey, query[queryKey]);
        });

      } else {

        if (id) {
          if (_this.data) {
            var key = key.pluralize();

            if (_this.data[key]) {
              data = _this.data[key].findBy('id', +id);

            } else {
              data = null;
            }
          } else {
            data = null;
          }
        } else {
          data = _this.data ? (_this.data[key] ? _this.data[key] : []) : [];
        }
      }


      return data;
    }
  };

  this.prepareBody = function(body) {
    return body ? JSON.stringify(body) : '{"error": "not found"}';
  };

  this.unhandledRequest = function(verb, path) {
    console.error("Your Ember app tried to " + verb + " '" + path + "', but there was no Pretender route defined to handle this request.");
  };

  this.stub = function(verb, path, handler, code) {
    var store = this.store;

    this[verb].call(this, path, function(request) {
      var code = code || 200;
      var data = {};
      var storeKeys;

      if (typeof handler === 'function') {
        data = handler(store, request);

      // Convenince methods
      } else {

        if (typeof handler === 'string') {
          storeKeys = [handler];

        } else {
          storeKeys = handler;
        }

        var owner;
        var ownerKey;
        storeKeys.forEach(function(key) {

          // There's an owner. Find only related.
          if (ownerKey) {
            var ownerIdKey = ownerKey.singularize() + '_id';
            var query = {};
            query[ownerIdKey] = owner.id;
            data[key] = store.find(key, query);

          } else {

            // TODO: This is a crass way of seeing if we're looking for a single model, doens't work for e.g. sheep
            if (key.singularize() === key) {
              ownerKey = key;
              var model = store.find(key, request.params.id);
              data[key] = model;
              owner = model;

            } else {
              data[key] = store.find(key);
            }
          }
        });
      }


      console.log('Successful request: ' + verb + ' ' + path);
      console.log(data);
      return [code, {"Content-Type": "application/json"}, data];
    })
  }.bind(this);
};

export default {
  setupData: setupData,
  defaults: defaults,
  userConfig: userConfig
}
