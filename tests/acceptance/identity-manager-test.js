import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | identity manager');

test('uses custom identity manager', function(assert) {
  let author = server.create('author');
  assert.equal(author.id, 'a');
});
