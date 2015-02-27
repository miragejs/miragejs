import ContactFactory from './contact';

export default ContactFactory.extend({
  is_young: function() {
    return this.age < 18;
  }
});
