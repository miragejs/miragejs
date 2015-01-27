import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {
    // debugger;
    return Ember.$.getJSON('blah');
    // return Ember.$.getJSON('/api/users', function(yes) {
    //   console.log(yes);
    // }, function(reason) {
    //   console.error(reason);
    // });
  }

});
