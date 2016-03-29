import {test} from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Edit');

test('I can edit a contact', function(assert) {
  server.create('contact');

  visit('/1');
  click('button:contains(Edit)');
  fillIn('input', 'Shiek');
  click('button:contains(Save)');

  andThen(function() {
    assert.equal(currentRouteName(), 'contact');
    assert.equal(find('p:first').text(), 'The contact is Shiek');
  });
});

