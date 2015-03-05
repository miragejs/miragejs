import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: 'Pete',
  age: 20,

  email: function(i) {
    return `person${i}@test.com`;
  },

  admin: function() {
    return this.age > 30;
  }
});
