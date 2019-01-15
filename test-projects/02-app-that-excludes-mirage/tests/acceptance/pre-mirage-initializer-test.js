import { test } from 'qunit';
import moduleForAcceptance from 'basic-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | noop initializer test');

test('visiting /noop-initializer-test', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(find('p:contains(We ran the initializer)').length, 1);
  });
});
