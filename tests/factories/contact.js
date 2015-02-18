import EP from 'ember-pretenderify';

export default EP.Factory.define({

  // name: EP.faker('name'),
  name: 'Pete',

  age: 20,

  // email: function(self, n) {
  //   return `person${n}@test.com`;
  // },

  // admin: function(self) {
  //   return self.age > 30;
  // }

});
