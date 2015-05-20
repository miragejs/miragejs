import { singularize } from '../utils/inflector';

var allDigitsRegex = /^\d+$/;

export default {

  getIdForRequest: function(request) {
    var id;

    if (request && request.params && request.params.id) {
      id = request.params.id;
      // If parses, coerce to integer
      if (typeof id === "string" && allDigitsRegex.test(id)) {
        id = parseInt(request.params.id, 10);
      }
    }

    return id;
  },

  getUrlForRequest: function(request) {
    var url;

    if (request && request.url) {
      url = request.url;
    }

    return url;
  },

  getTypeFromUrl: function(url, hasId) {
    var urlNoId = hasId ? url.substr(0, url.lastIndexOf('/')) : url;
    var urlSplit = urlNoId.split("?");
    var urlNoIdNoQuery = urlSplit[0].slice(-1) === '/' ? urlSplit[0].slice(0, -1) : urlSplit[0];
    var type = singularize(urlNoIdNoQuery.substr(urlNoIdNoQuery.lastIndexOf('/') + 1));

    return type;
  },

  getJsonBodyForRequest: function(request) {
    var body;

    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }

    return body;
  }

};
