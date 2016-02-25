import { IdentityManager } from 'ember-cli-mirage/db-collection';

import {module, test} from 'qunit';

module('Unit | DB | IdentityManager');

test('it can be instantiated', function(assert) {
  let manager = new IdentityManager();
  assert.ok(manager);
});

test(`fetch returns the latest number`, function(assert) {
  let manager = new IdentityManager();

  assert.equal(manager.fetch(), 1);
  assert.equal(manager.fetch(), 2);
  assert.equal(manager.fetch(), 3);
});

test(`get returns the upcoming id used for fetch`, function(assert) {
  let manager = new IdentityManager();

  assert.equal(manager.fetch(), 1);
  assert.equal(manager.get(), 2);
  assert.equal(manager.fetch(), 2);
});

test(`set indicates an id is being used`, function(assert) {
  let manager = new IdentityManager();
  manager.set('abc');

  assert.throws(function() {
    manager.set('abc');
  }, /already been used/);
});

test(`a numerical value passed into set affects future ids used by fetch`, function(assert) {
  let manager = new IdentityManager();
  manager.set(5);

  assert.equal(manager.fetch(), 6);
  assert.equal(manager.fetch(), 7);
});

test(`multiple numerical values passed into set affects future ids used by fetch`, function(assert) {
  let manager = new IdentityManager();
  manager.set(5);
  manager.set(6);

  assert.equal(manager.fetch(), 7);
  assert.equal(manager.fetch(), 8);
});

test(`an int as a string passed into set affects future ids used by fetch`, function(assert) {
  let manager = new IdentityManager();
  manager.set('5');

  assert.equal(manager.fetch(), 6);
  assert.equal(manager.fetch(), 7);
});

test(`multiple ints as a string passed into set affects future ids used by fetch`, function(assert) {
  let manager = new IdentityManager();
  manager.set('5');
  manager.set('6');

  assert.equal(manager.fetch(), 7);
  assert.equal(manager.fetch(), 8);
});

test(`a string value that doesn't parse as an int passed into set doesn't affect future ids used by fetch`, function(assert) {
  let manager = new IdentityManager();
  manager.set('123-abc');

  assert.equal(manager.fetch(), 1);
  assert.equal(manager.fetch(), 2);
});

test(`reset clears the managers memory`, function(assert) {
  let manager = new IdentityManager();
  manager.set('abc');
  manager.reset();
  manager.set('abc');

  assert.ok(true);
});
