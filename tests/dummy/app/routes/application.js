import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    saveContact: function(contact) {
      return contact.save().then((contact) => {
        this.transitionTo('contact', contact);
      });
    },

    deleteContact: function(contact) {
      return contact.destroyRecord().then(() => {
        this.transitionTo('contacts');
      });
    }
  }

});
