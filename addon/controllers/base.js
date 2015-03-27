import Ember from 'ember';
import { singularize } from '../utils/inflector';

export default Ember.Object.extend({

  functionHandler: function(handler, db, request) {
    return handler(db, request);
  },

  objectHandler: function(object, db, request) {
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

  _getTypeFromUrl: function(url, hasId) {
    var urlNoId = hasId ? url.substr(0, url.lastIndexOf('/')) : url;
    var urlNoIdNoQuery = urlNoId.split("?")[0];
    var type = singularize(urlNoIdNoQuery.substr(urlNoIdNoQuery.lastIndexOf('/') + 1));

    return type;
  },

  _getJsonBodyForRequest: function(request) {
    var body;

    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }

    return body;
  }
});
