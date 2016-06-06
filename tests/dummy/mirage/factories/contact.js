import Mirage from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: faker.list.cycle('Duke', 'Developer', 'Artist'),
  name: faker.name.firstName,
  age: 20,

  email(i) {
    return `person${i}@test.com`;
  },

  admin() {
    return this.age > 30;
  }

});
