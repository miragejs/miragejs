import EP from 'ember-pretenderify';

export default EP.Factory.extend({

  name: 'Pete',

  age: 20,

  email: function(i) {
    return `person${i}@test.com`;
  },

  admin: function() {
    return this.age > 30;
  }

});
