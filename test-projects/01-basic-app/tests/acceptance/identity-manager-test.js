import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Identity manager');

test('custom identity managers work', function(assert) {
  let book = server.create('book');

  assert.equal(book.id, 'a');
});
