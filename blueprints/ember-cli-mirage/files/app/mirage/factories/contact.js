/*
  This is an example factory definition. Factories are
  used inside acceptance tests.

  Create more files in this directory to define additional factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: 'Pete',
  age: 20,

  email: (i) => `person${i}@test.com`,

  admin: function() {
    return this.age > 30;
  }
});
