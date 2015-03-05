import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.store.find('contact').then(null ,() => {
      this.set('hasError', true);
    });
  },

  setupController(controller, model) {
    if (this.get('hasError')) {
      controller.set('hasError', true);
    } else {
      controller.set('model', model);
    }
  }

});
