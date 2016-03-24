import {test} from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

let pets;

moduleForAcceptance('Acceptance | Pets', {
  beforeEach() {
    pets = server.createList('pet', 3);
  }
});

test('I can view the pets', function(assert) {
  visit('/pets');

  andThen(function() {
    assert.equal(currentRouteName(), 'pets');
    assert.equal(find('li').length, 3);
    assert.equal(find('li:first .name').text().trim(), pets[0].name);
  });
});

test('I can create a new pet', function(assert) {
  visit('/pets');

  fillIn('input', 'Brownie');
  click('button:contains(create)');

  andThen(function() {
    assert.equal(currentRouteName(), 'pets');
    assert.equal(find('li').length, 4);
    assert.equal(find('li:last .name').text(), 'Brownie');
  });
});
