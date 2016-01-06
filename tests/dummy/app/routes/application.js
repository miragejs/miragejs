import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    createContact() {
      let controller = this.controllerFor('contacts');
      let name = controller.get('newName');
      let newContact = this.store.createRecord('contact', { name });
      controller.set('newName', '');

      return newContact.save();
    },

    saveContact(contact) {
      return contact.save().then((contact) => {
        this.transitionTo('contact', contact);
      });
    },

    deleteContact(contact) {
      return contact.destroyRecord().then(() => {
        this.transitionTo('contacts');
      });
    }
  }

});
