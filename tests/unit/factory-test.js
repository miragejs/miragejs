import Factory from 'ember-cli-mirage/factory';

import {module, test} from 'qunit';

module('mirage:factory');

test('it exists', function(assert) {
  assert.ok(Factory);
});

test('the base class builds empty objects', function(assert) {
  var f = new Factory();
  var data = f.build();

  assert.deepEqual(data, {});
});

test('a noop extension builds empty objects', function(assert) {
  var EmptyFactory = Factory.extend();
  var f = new EmptyFactory();
  var data = f.build();

  assert.deepEqual(data, {});
  assert.ok(Factory.extend);
});

test('it works with strings and numbers', function(assert) {
  var AFactory = Factory.extend({
    name: 'Sam',
    age: 28,
  });

  var f = new AFactory();
  var data = f.build();

  assert.deepEqual(data, {name: 'Sam', age: 28});
});

test('it has access to its own plain attrs', function(assert) {
  var SamFactory = Factory.extend({
    name: 'Sam',
    age: 28,
    admin: function(n) {
      return this.age > 30;
    }
  });
  var GandalfFactory = Factory.extend({
    name: 'Gandalf',
    age: 500,
    admin: function() {
      return this.age > 30;
    },
  });

  var s = new SamFactory();
  var sam = s.build();
  var g = new GandalfFactory();
  var gandalf = g.build();

  assert.deepEqual(sam, {name: 'Sam', age: 28, admin: false});
  assert.deepEqual(gandalf, {name: 'Gandalf', age: 500, admin: true});
});

test('it has access to its sequence', function(assert) {
  var SamFactory = Factory.extend({
    name: 'Sam',
    age: 28,
    email: function(n) {
      return `person${n}@test.com`;
    }
  });

  var s = new SamFactory();
  var data1 = s.build(1);
  var data2 = s.build(2);

  assert.deepEqual(data1, {name: 'Sam', age: 28, email: 'person1@test.com'});
  assert.deepEqual(data2, {name: 'Sam', age: 28, email: 'person2@test.com'});
});

test('it supports inheritance', function(assert) {
  var PersonFactory = Factory.extend({
    species: 'human'
  });
  var ManFactory = PersonFactory.extend({
    gender: 'male'
  });
  var SamFactory = ManFactory.extend({
    name: 'Sam'
  });

  var p = new PersonFactory();
  var person = p.build();

  var m = new ManFactory();
  var man = m.build();

  var s = new SamFactory();
  var sam = s.build();

  assert.deepEqual(person, {species: 'human'});
  assert.deepEqual(man, {species: 'human', gender: 'male'});
  assert.deepEqual(sam, {species: 'human', gender: 'male', name: 'Sam'});
});
