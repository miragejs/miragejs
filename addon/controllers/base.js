import Ember from 'ember';

export default Ember.Object.extend({

  functionHandler: function(handler, store, request) {
    return handler(store, request);
  }

});
