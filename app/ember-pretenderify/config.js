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
      key = key.pluralize();
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
    },

    push: function(key, data) {
      var dataKey = key.pluralize();
      if (data.id) {
        // update
      } else {
        var currentModels = _this.data[dataKey];
        var newId = 1;
        if (currentModels.length) {
          var currentModelIds = currentModels.map(function(model) { return model.id; });
          newId = Math.max.apply(null, currentModelIds) + 1;
        }

        data[key].id = newId;
        _this.data[dataKey].push(data[key]);
      }

      return data;
    },

    remove: function(key, id) {
      var dataKey = key.pluralize();

      if (typeof id === 'object') {
        var query = id;
        Object.keys(query).forEach(function(queryKey) {
          _this.data[dataKey] = _this.data[dataKey].rejectBy(queryKey, query[queryKey]);
        });

      } else {
        _this.data[dataKey] = _this.data[dataKey].rejectBy('id', id);

      }

      return {};
    }
  };

  this.prepareBody = function(body) {
    return body ? JSON.stringify(body) : '{"error": "not found"}';
  };

  this.unhandledRequest = function(verb, path) {
    console.error("Your Ember app tried to " + verb + " '" + path + "', but there was no Pretender route defined to handle this request.");
  };

  this.handleGet = function(handler, store, request, code) {
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

    console.log(data);
    return [code, {"Content-Type": "application/json"}, data];
  };

  this.handlePost = function(handler, store, request, code) {
    var code = code || 201;
    var data = {};

    if (typeof handler === 'function') {
      data = handler(store, request);

    } else if (typeof handler === 'undefined') {
      var url = request.url;
      var type = url.substr(url.lastIndexOf('/') + 1).singularize();
      var postData = JSON.parse(request.requestBody);

      data = store.push(type, postData);

    } else if (typeof handler === 'string') {
      var type = handler;
      var postData = JSON.parse(request.requestBody);

      data = store.push(type, postData);
    }

    console.log(data);
    return [code, {"Content-Type": "application/json"}, data];
  };

  this.handleDelete = function(handler, store, request, code) {
    var code = code || 200;
    var data = {};

    if (typeof handler === 'function') {
      data = handler(store, request);

    } else if (typeof handler === 'undefined') {
      var url = request.url;
      var id = +url.substr(url.lastIndexOf('/') + 1).singularize();

      // Strip the id
      url = url.substr(0, url.lastIndexOf('/'))
      var type = url.substr(url.lastIndexOf('/') + 1).singularize();
      var postData = JSON.parse(request.requestBody);

      data = store.remove(type, id);

    } else if (Ember.isArray(handler)) {
      var url = request.url;
      var id = +url.substr(url.lastIndexOf('/') + 1).singularize();
      var types = handler;
      var parentType = types.shift();

      store.remove(parentType, id);

      var parentIdKey = parentType + '_id';
      types.forEach(function(type) {
        var query = {}
        query[parentIdKey] = id;
        store.remove(type, query);
      });
      data = {};

    } else if (typeof handler === 'string') {
      var url = request.url;
      var id = +url.substr(url.lastIndexOf('/') + 1).singularize();
      var type = handler;


      data = store.remove(type, id);
    }

    console.log(data);
    return [code, {"Content-Type": "application/json"}, data];
  };

  this.stub = function(verb, path, handler, code) {
    var store = this.store;
    var _this = this;
    var namespace = this.namespace || '';
    path = path[0] === '/' ? path.slice(1) : path;

    this[verb].call(this, namespace + '/' + path, function(request) {
      console.log('Successful request: ' + verb + ' ' + path);
      var stubHandler = 'handle' + verb.capitalize();

      return _this[stubHandler].call(this, handler, store, request, code);
    })
  }.bind(this);
};

export default {
  setupData: setupData,
  defaults: defaults,
  userConfig: userConfig
}
