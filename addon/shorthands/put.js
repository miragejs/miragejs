import { pluralize } from '../utils/inflector';
import utils from './utils';

/*
  Shorthands for PUT requests.
*/
export default {

  /*
    Update an object from the db, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  string: function(type, db, request) {
    var id = utils.getIdForRequest(request);
    var putData = utils.getJsonBodyForRequest(request);
    var attrs = putData[type];
    var collection = pluralize(type);
    attrs.id = id;

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var data = db[collection].update(id, attrs);

    var response = {};
    response[type] = data;

    return response;
  },

  /*
    Update an object from the db based on singular version
    of the last portion of the url.

      this.stub('put', '/contacts/:id');
  */
  undefined: function(undef, db, request) {
    var id = utils.getIdForRequest(request);
    var url = utils.getUrlForRequest(request);
    var type = utils.getTypeFromUrl(url, id);
    var collection = pluralize(type);
    var putData = utils.getJsonBodyForRequest(request);
    var attrs = putData[type];

    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var data = db[collection].update(id, attrs);

    var response = {};
    response[type] = data;

    return response;
  }

};
