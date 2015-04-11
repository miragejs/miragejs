import Ember from 'ember';
import shorthandHandlers from 'ember-cli-mirage/shorthands/index';

var defaultCodes = {
  put: 204,
  post: 201,
  delete: 204
};

export default {

  handle: function(verb, handler, db, request, code) {
    code = code ? code : (defaultCodes[verb] || 200);

    var handlerMethod = this._lookupHandlerMethod(verb, handler);
    var data = handlerMethod(handler, db, request, code);

    if (data) {
      return [code, {"Content-Type": "application/json"}, data];
    } else {
      return [code, {}, undefined];
    }
  },

  _lookupHandlerMethod: function(verb, handler) {
    var type = typeof handler;
    type = Ember.isArray(handler) ? 'array' : type;

    var handlerMethod;

    if (type === 'function' || type === 'object') {
      handlerMethod = this['_' + type + 'Handler'];
    } else {
      handlerMethod = shorthandHandlers[verb][type];
    }

    return handlerMethod;
  },

  _functionHandler: function(handler, db, request) {
    var data;

    try {
      data = handler(db, request);
    } catch(error) {
      console.error('Mirage: Your custom function handler for the url ' + request.url + ' threw an error:', error.message, error.stack);
    }

    return data;
  },

  _objectHandler: function(object /*, db, request*/) {
    return object;
  }

};
