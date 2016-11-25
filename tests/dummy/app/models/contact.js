import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  age: attr('number'),
  email: attr('string'),

  address: belongsTo('address')
});
