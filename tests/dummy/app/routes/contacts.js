import Ember from 'ember';

const { Route } = Ember;

export default Route.extend({

  model() {
    return this.store.findAll('contact')
      .catch((reason) => {
        let errorMsg = reason.responseJSON ? reason.responseJSON.errors[0] : reason.errors[0];

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
