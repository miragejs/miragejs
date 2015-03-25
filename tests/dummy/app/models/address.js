import DS from 'ember-data';

export default DS.Model.extend({
  street: DS.attr('string'),

  contact: DS.belongsTo('contact'),
});
