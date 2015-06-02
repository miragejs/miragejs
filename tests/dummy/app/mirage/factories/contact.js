import Mirage from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: faker.name.firstName,
  age: 20,

  email: function(i) {
    return `person${i}@test.com`;
  },

  admin: function() {
    return this.age > 30;
  }
});
