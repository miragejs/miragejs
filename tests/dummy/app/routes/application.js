import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    createContact: function() {
      var name = this.controllerFor('contacts').get('newName');
      var newContact = this.store.createRecord('contact', {
        name: name
      });

      this.controllerFor('contacts').set('newName', '');

      return newContact.save();
    },

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
