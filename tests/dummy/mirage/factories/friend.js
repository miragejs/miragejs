import ContactFactory from './contact';

export default ContactFactory.extend({
  isYoung() {
    return this.age < 18;
  }
});
