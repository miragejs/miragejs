import DS from 'ember-data';

var string = DS.attr('string');
var number = DS.attr('number');
var boolean = DS.attr('boolean');

export default DS.Model.extend({
  name: string,
  age: number,
  email: string,
  admin: boolean
});
