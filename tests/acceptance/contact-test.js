import {test} from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

let contact;

moduleForAcceptance('Acceptance | Contact', {
  beforeEach() {
    contact = server.create('contact');
  }
});

test('I can view a contact', function(assert) {
  visit('/1');

  andThen(function() {
    assert.equal(currentRouteName(), 'contact');
    assert.equal(find('p:first').text(), `The contact is ${contact.name}`);
  });
});

test('I can delete a contact', function(assert) {
  visit('/1');
  click('button:contains(Delete)');

  andThen(function() {
    assert.equal(currentRouteName(), 'contacts');
    assert.equal(find('p').length, 0);
  });
});
