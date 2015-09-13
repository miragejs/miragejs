import { pluralize } from '../utils/inflector';
import utils from './utils';
import Db from '../db';

/*
  Shorthands for POST requests.
*/

/*
  Push a new model of type *type* to the db.

  For example, this will push a 'user':
    this.stub('post', '/contacts', 'contact');
*/
function stringPost(string, dbOrSchema, request) {
  let type = string;
  let collection = pluralize(string);
  let postData = utils.getJsonBodyForRequest(request);
  let attrs = postData[type];
  // debugger;

  if (dbOrSchema instanceof Db) {
    let db = dbOrSchema;
    if (!db[collection]) {
      console.error("Mirage: The route handler for " + request.url + " is trying to insert data into the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
    }

    let model = db[collection].insert(attrs);

    let response = {};
    response[type] = model;

    return response;

  } else {
    let schema = dbOrSchema;
    let model = schema[type].create(attrs);

    return model;
  }
}

/*
  Push a new model to the db. The type is found
  by singularizing the last portion of the URL.

  For example, this will push a 'contact'.
    this.stub('post', '/contacts');
*/
function undefinedPost(undef, dbOrSchema, request) {
  let url = utils.getUrlForRequest(request);
  let type = utils.getTypeFromUrl(url);

  return stringPost(type, dbOrSchema, request);
}

export default {
  string: stringPost,
  undefined: undefinedPost
};
