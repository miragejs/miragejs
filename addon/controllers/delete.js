import BaseController from './base';

export default BaseController.extend({

  handle: function(handler, store, request, code) {
    var code = code || 200;
    var data = {};

    if (typeof handler === 'function') {
      data = handler(store, request);

    } else if (typeof handler === 'undefined') {
      var url = request.url;
      var id = +url.substr(url.lastIndexOf('/') + 1).singularize();

      // Strip the id
      url = url.substr(0, url.lastIndexOf('/'))
      var type = url.substr(url.lastIndexOf('/') + 1).singularize();
      var postData = JSON.parse(request.requestBody);

      data = store.remove(type, id);

    } else if (Ember.isArray(handler)) {
      var url = request.url;
      var id = +url.substr(url.lastIndexOf('/') + 1).singularize();
      var types = handler;
      var parentType = types.shift();

      store.remove(parentType, id);

      var parentIdKey = parentType + '_id';
      types.forEach(function(type) {
        var query = {}
        query[parentIdKey] = id;
        store.remove(type, query);
      });
      data = {};

    } else if (typeof handler === 'string') {
      var url = request.url;
      var id = +url.substr(url.lastIndexOf('/') + 1).singularize();
      var type = handler;


      data = store.remove(type, id);
    }

    console.log(data);
    return [code, {"Content-Type": "application/json"}, data];
  }

});
