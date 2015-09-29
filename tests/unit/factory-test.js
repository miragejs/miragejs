import Mirage from 'ember-cli-mirage';

import {module, test} from 'qunit';

module('Unit | Factory');

test('it exists', function(assert) {
  assert.ok(Mirage.Factory);
});

test('the base class builds empty objects', function(assert) {
  var f = new Mirage.Factory();
  var data = f.build();

  assert.deepEqual(data, {});
});

test('a noop extension builds empty objects', function(assert) {
  var EmptyFactory = Mirage.Factory.extend();
  var f = new EmptyFactory();
  var data = f.build();

  assert.deepEqual(data, {});
});

test('it works with strings, numbers and booleans', function(assert) {
  var AFactory = Mirage.Factory.extend({
    name: 'Sam',
    age: 28,
    alive: true
  });

  var f = new AFactory();
  var data = f.build();

  assert.deepEqual(data, {name: 'Sam', age: 28, alive: true});
});

test('it supports inheritance', function(assert) {
  var PersonFactory = Mirage.Factory.extend({
    species: 'human'
  });
  var ManFactory = PersonFactory.extend({
    gender: 'male'
  });
  var SamFactory = ManFactory.extend({
    name: 'Sam'
  });

  var p = new PersonFactory();
  var m = new ManFactory();
  var s = new SamFactory();

  assert.deepEqual(p.build(), {species: 'human'});
  assert.deepEqual(m.build(), {species: 'human', gender: 'male'});
  assert.deepEqual(s.build(), {species: 'human', gender: 'male', name: 'Sam'});
});

test('it can use sequences', function(assert) {
  var PostFactory = Mirage.Factory.extend({
    likes: function(i) {
      return 5*i;
    }
  });

  var p = new PostFactory();
  var post1 = p.build(1);
  var post2 = p.build(2);

  assert.deepEqual(post1, {likes: 5});
  assert.deepEqual(post2, {likes: 10});
});
