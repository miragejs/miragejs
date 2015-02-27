import ContactFactory from './contact';

export default ContactFactory.extend({
  admin: function() {
    return this.age > 30;
  }
});
