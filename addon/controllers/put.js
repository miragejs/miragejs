import { singularize } from '../utils/inflector';
import BaseController from './base';

/*
  Shorthands for PUT requests.
*/
export default BaseController.extend({

  /*
    Update an object from the store, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  stringHandler: function(type, store, request) {
    var id = this._getIdForRequest(request);
    var putData = this._getJsonBodyForRequest(request);
    var attrs = putData[type];
    attrs.id = id;

    var data = store.push(type, attrs);

    return data;
  },

  /*
    Update an object from the store based on singular version
    of the last portion of the url.

      this.stub('put', '/contacts/:id');
  */
  undefinedHandler: function(undef, store, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var urlNoId = url.substr(0, url.lastIndexOf('/'));
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));
    var putData = this._getJsonBodyForRequest(request);
    var attrs = putData[type];
    attrs.id = id;

    var data = store.push(type, attrs);

    return data;
  }

});
