import Ember from 'ember';

const { Route } = Ember;

export default Route.extend({

  model() {
    let store = this.get('store');
    return store.query('friend', { ids: [1, 3] }).then(function() {
      // I request 2 friends and then return all friends to be sure no other friend
      // was loaded into the store.
      return store.peekAll('friend');
    });
  }

});
