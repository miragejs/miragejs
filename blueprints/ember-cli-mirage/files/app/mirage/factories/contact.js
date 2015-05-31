/*
  This is an example factory definition. Factories are
  used inside acceptance tests.

  Create more files in this directory to define additional factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  // name: 'Pete',                         // strings
  // age: 20,                              // numbers
  // tall: true,                           // booleans

  // email: (i) => `person${i}@test.com`,  // and functions

  // admin: function() {
  //   return this.age > 30;
  // }
});
