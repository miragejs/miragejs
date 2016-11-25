import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  street: attr('string'),

  contact: belongsTo('contact')
});
