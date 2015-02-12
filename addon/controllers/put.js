import { singularize } from '../inflector';
import BaseController from './base';

export default BaseController.extend({

  /*
    Update an object from the store based on singular version
    of the last portion of the url.

      this.stub('put', '/contacts/:id');
  */
  undefinedHandler: function(undef, store, request) {
    var id = request.params.id;
    var url = request.url;
    var urlNoId = url.substr(0, url.lastIndexOf('/'));
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));
    var modelData = JSON.parse(request.requestBody);
    var attrs = modelData[type];
    attrs.id = +id;

    var data = store.push(type, attrs);

    return data;
  },

  /*
    Update an object from the store, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  stringHandler: function(type, store, request) {
    var id = request.params.id;
    var modelData = JSON.parse(request.requestBody);
    var attrs = modelData[type];
    attrs.id = +id;

    var data = store.push(type, attrs);

    return data;
  }

});
