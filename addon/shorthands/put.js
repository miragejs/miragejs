import { pluralize } from '../utils/inflector';
import utils from './utils';
import Db from '../db';

/*
  Update an object from the db, specifying the type.

    this.stub('put', '/contacts/:id', 'user');
*/
function stringPut(type, dbOrSchema, request) {
  var id = utils.getIdForRequest(request);
  var putData = utils.getJsonBodyForRequest(request);
  var attrs = putData[type];
  var collection = pluralize(type);
  attrs.id = id;

  if (dbOrSchema instanceof Db) {
    let db = dbOrSchema;
    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    var data = db[collection].update(id, attrs);

    var response = {};
    response[type] = data;

    return response;

  } else {
    let schema = dbOrSchema;

    return schema[type].find(id).update(attrs);
  }
}

/*
  Update an object from the db based on singular version
  of the last portion of the url.

    this.stub('put', '/contacts/:id');
*/
function undefinedPut(undef, dbOrSchema, request) {
  var id = utils.getIdForRequest(request);
  var url = utils.getUrlForRequest(request);
  var type = utils.getTypeFromUrl(url, id);

  return stringPut(type, dbOrSchema, request);
}

export default {
  string: stringPut,
  undefined: undefinedPut
};
