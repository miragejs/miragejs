import DS from 'ember-data';
import Contact from './contact';

const { attr } = DS;

export default Contact.extend({
  isYoung: attr('boolean')
});
