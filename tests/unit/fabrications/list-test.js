import cycle from 'ember-cli-mirage/fabrications/cycle';

import {module, test} from 'qunit';

module('mirage:fabrications#cycle');

test('returns a function', function (assert) {
  var callback = cycle('first', 'second');
  assert.ok(typeof callback === 'function', 'result is a function');
});

test('cycles the passed data', function (assert) {
  var callback = cycle('first', 'second', 'third');

  assert.equal(callback(0), 'first', 'return the first result for sequence 0');
  assert.equal(callback(1), 'second', 'return the first result for sequence 1');
  assert.equal(callback(2), 'third', 'return the first result for sequence 2');
  assert.equal(callback(3), 'first', 'return the first result for sequence 3');
});
