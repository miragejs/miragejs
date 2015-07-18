import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  age: DS.attr('number'),
  email: DS.attr('string'),

  address: DS.belongsTo('address')
});
