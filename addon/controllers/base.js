import Ember from 'ember';

export default Ember.Object.extend({

  functionHandler: function(handler, store, request) {
    return handler(store, request);
  },

  // Private methods
  _getIdForRequest: function(request) {
    var id;
    if (request && request.params && request.params.id) {
      id = request.params.id;
    }

    return id;
  },

  _getUrlForRequest: function(request) {
    var url;
    if (request && request.url) {
      url = request.url;
    }

    return url;
  }
});
