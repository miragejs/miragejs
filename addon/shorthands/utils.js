import { singularize } from '../utils/inflector';

export default {

  getIdForRequest: function(request) {
    var id;

    if (request && request.params && request.params.id) {
      id = request.params.id;
      // If the id is not a number, return the string. Otherwise, parse it as an integer
      id = isNaN(id) ? id : parseInt(id, 10);
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
    var urlNoIdNoQuery = urlNoId.split("?")[0];
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
