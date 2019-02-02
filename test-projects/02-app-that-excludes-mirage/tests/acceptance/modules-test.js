import { test } from 'qunit';
import moduleForAcceptance from 'basic-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | modules');

test('only 1 module (the no-op initializer) is included in the build', function(assert) {
  visit('/');

  andThen(function() {
    assert.dom('[data-test-id="mirage-module-count"]').hasText('0');
    assert.dom('[data-test-id="other-module-count"]').hasText('1');
  });
});
