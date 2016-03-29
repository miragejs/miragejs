import faker from 'ember-cli-mirage/faker';

import {module, test} from 'qunit';

module('Unit | Faker');

test('#cycle - returns a function', function(assert) {
  let callback = faker.list.cycle('first', 'second');
  assert.ok(typeof callback === 'function', 'result is a function');
});

test('#cycle - cycles the passed data', function(assert) {
  let callback = faker.list.cycle('first', 'second', 'third');

  assert.equal(callback(0), 'first', 'return the first result for sequence 0');
  assert.equal(callback(1), 'second', 'return the first result for sequence 1');
  assert.equal(callback(2), 'third', 'return the first result for sequence 2');
  assert.equal(callback(3), 'first', 'return the first result for sequence 3');
});

test('#random - returns random element from a list', function(assert) {
  let callback = faker.list.random('first', 'second', 'third');

  assert.notEqual(['first', 'second', 'third'].indexOf(callback()), -1, 'returns random value');
});

test('#range - creates a random number in a range', function(assert) {
  let min = 0;
  let max = 10;

  let callback = faker.random.number.range(min, max);
  assert.equal(callback() >= min, true, 'result is higher or equal than low value');
  assert.equal(callback() <= max, true, 'result is lower or equal than high value');
});
