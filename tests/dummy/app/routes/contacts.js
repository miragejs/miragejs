import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.store.find('contact').then(null, (reason) => {
      var errorMsg = reason.responseJSON ? reason.responseJSON.errors[0] :
                                           reason.errors[0];
      this.set('error', errorMsg);
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
