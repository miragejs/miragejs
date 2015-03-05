import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.store.find('contact').then(null, (reason) => {
      this.set('error', reason.responseJSON.errors[0]);
    });
  },

  setupController(controller, model) {
    if (this.get('error')) {
      controller.set('error', this.get('error'));
    } else {
      controller.set('model', model);
    }
  }

});
