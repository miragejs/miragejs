import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: function (i) {
    return this.faker.name.firstName();
  },
  age: 20,

  email: function(i) {
    return `person${i}@test.com`;
  },

  admin: function() {
    return this.age > 30;
  }
});
