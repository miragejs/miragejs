import {test} from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Edit');

test('I can edit a contact', function(assert) {
  let contact = server.create('contact');

  visit(`/${contact.id}`);
  click('button:contains(Edit)');
  fillIn('input', 'Shiek');
  click('button:contains(Save)');

  andThen(function() {
    assert.equal(currentRouteName(), 'contact');
    assert.equal(find('p:first').text(), 'The contact is Shiek');
  });
});
