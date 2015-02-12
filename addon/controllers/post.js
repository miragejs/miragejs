import { singularize } from '../inflector';
import BaseController from './base';

/*
  Shorthands for POST requests.
*/
export default BaseController.extend({

  /*
    Push a new model of type *type* to the store.

    For example, this will push a 'user':
      this.stub('post', '/contacts', 'contact');
  */
  stringHandler: function(type, store, request) {
    var postData = JSON.parse(request.requestBody);
    var attrs = postData[type];
    var data = store.push(type, attrs);

    return data;
  },

  /*
    Push a new model to the store. The type is found
    by singularizing the last portion of the URL.

    For example, this will push a 'contact'.
      this.stub('post', '/contacts');
  */
  undefinedHandler: function(undef, store, request) {
    var url = request.url;
    var type = singularize(url.substr(url.lastIndexOf('/') + 1));
    var postData = JSON.parse(request.requestBody);
    var attrs = postData[type];
    var data = store.push(type, attrs);

    return data;
  }

});
