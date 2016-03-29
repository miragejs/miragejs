import ContactFactory from './contact';

export default ContactFactory.extend({
  isYoung: function() {
    return this.age < 18;
  }
});
