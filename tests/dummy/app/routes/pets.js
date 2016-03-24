import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    createPet() {
      let controller = this.controllerFor('pets');
      let name = controller.get('petName');
      controller.set('petName', '');
      this.store.createRecord('pet', { name, alive: true });
    }
  },

  setupController(controller, model) {
    if (this.get('error')) {
      controller.set('error', this.get('error'));
    } else {
      controller.set('model', model);
    }
  },

  model() {
    return this.store.findAll('pet').catch((reason) => {
      let errorMsg = reason.responseJSON ? reason.responseJSON.errors[0] : reason.errors[0];
      this.set('error', errorMsg);
    });
  }
});
