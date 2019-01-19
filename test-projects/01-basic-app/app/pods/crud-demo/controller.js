import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  store: service(),

  actions: {
    createUser() {
      let name = this.get('newName');

      this.get('store')
        .createRecord('user', { name })
        .save()
        .then(() => {
          this.set('newName', '');
        });
    },

    updateUser(user) {
      user.save();
    },

    deleteUser(user) {
      user.destroyRecord();
    }
  }

});
