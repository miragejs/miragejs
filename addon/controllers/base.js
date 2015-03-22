import Ember from 'ember';

export default Ember.Object.extend({

  functionHandler: function(handler, db, request) {
    return handler(db, request);
  },

  objectHandler: function(object /*, db, request*/) {
    return object;
  },

  // Private methods
  _getIdForRequest: function(request) {
    var id;

    if (request && request.params && request.params.id) {
      id = request.params.id;
      // If parses, coerce to integer
      id = parseInt(id, 10) || id;
    }

    return id;
  },

  _getUrlForRequest: function(request) {
    var url;

    if (request && request.url) {
      url = request.url;
    }

    return url;
  },

  _getJsonBodyForRequest: function(request) {
    var body;

    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }

    return body;
  }
});
