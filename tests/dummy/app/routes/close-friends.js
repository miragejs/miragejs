import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {
    var store = this.store;
    return store.find('friend', { ids: [1, 3] }).then(function() {
      // I request 2 friends and then return all friends to be sure no other friend
      // was loaded into the store.
      return store.all('friend');
    });
  }

});
