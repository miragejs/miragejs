import EP from 'ember-pretenderify';

export default EP.Factory.define({

  name: 'Pete',

  age: 20,

  email: function(seq) {
    return `person${seq}@test.com`;
  },

  admin: function() {
    return this.age > 30;
  }

});
