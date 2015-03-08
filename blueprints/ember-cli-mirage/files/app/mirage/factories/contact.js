/*
  This is an example. This factory can be used inside
  of acceptance tests.

  Create more files in this directory to define more factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: 'Pete',
  age: 20,

  email: (i) => `person${i}@test.com`,

  admin: function(i) {
    return this.age > 30;
  }
});
