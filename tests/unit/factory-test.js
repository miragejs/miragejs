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

test('it can reuse static properties', function(assert) {
  var BazFactory = Mirage.Factory.extend({
    foo: 5,
    bar: function(i) {
      return this.foo * i;
    }
  });

  var b = new BazFactory();
  var baz1 = b.build(1);
  var baz2 = b.build(2);

  assert.deepEqual(baz1, {foo: 5, bar: 5});
  assert.deepEqual(baz2, {foo: 5, bar: 10});
});

test('it can reuse dynamic properties', function(assert) {
  var BazFactory = Mirage.Factory.extend({
    foo: function(i) {
      return 5*i;
    },
    bar: function() {
      return this.foo * 2;
    }
  });

  var b = new BazFactory();
  var baz1 = b.build(1);
  var baz2 = b.build(2);

  assert.deepEqual(baz1, {foo: 5, bar: 10});
  assert.deepEqual(baz2, {foo: 10, bar: 20});
});

test('it can reference properties out of order', function(assert) {
  var BazFactory = Mirage.Factory.extend({
    bar: function() {
      return this.foo + 2;
    },

    baz: 6,

    foo: function(i) {
      return this.baz * i;
    }
  });

  var b = new BazFactory();
  var baz1 = b.build(1);
  var baz2 = b.build(2);

  assert.deepEqual(baz1, {baz: 6, foo: 6, bar: 8});
  assert.deepEqual(baz2, {baz: 6, foo: 12, bar: 14});
});

test('it can reference multiple properties in any order', function(assert) {
  var FooFactory = Mirage.Factory.extend({
    foo: function() {
      return this.bar + this.baz;
    },

    bar: 6,

    baz: 10
  });

  var BarFactory = Mirage.Factory.extend({
    bar: 6,

    foo: function() {
      return this.bar + this.baz;
    },

    baz: 10
  });

  var BazFactory = Mirage.Factory.extend({
    bar: 6,

    baz: 10,

    foo: function() {
      return this.bar + this.baz;
    }
  });

  var Foo = new FooFactory();
  var Bar = new BarFactory();
  var Baz = new BazFactory();

  var foo = Foo.build(1);
  var bar = Bar.build(1);
  var baz = Baz.build(1);

  assert.deepEqual(foo, {foo: 16, bar: 6, baz: 10});
  assert.deepEqual(bar, {foo: 16, bar: 6, baz: 10});
  assert.deepEqual(baz, {foo: 16, bar: 6, baz: 10});
});

test('it can reference properties on complex object', function(assert) {
  var AbcFactory = Mirage.Factory.extend({
    a: function(i) {
      return this.b + i;
    },
    b: function() {
      return this.c + 1;
    },
    c: function() {
      return this.f + 1;
    },
    d: function(i) {
      return this.e + i;
    },
    e: function() {
      return this.c + 1;
    },
    f: 1,
    g: 2,
    h: 3,
  });

  var b = new AbcFactory();
  var abc1 = b.build(1);
  var abc2 = b.build(2);

  assert.deepEqual(abc1, {a: 4, b: 3, c: 2, d: 4, e: 3, f: 1, g: 2, h: 3});
  assert.deepEqual(abc2, {a: 5, b: 3, c: 2, d: 5, e: 3, f: 1, g: 2, h: 3});
});

test('throws meaningfull exception on circular reference', function(assert) {
  var BazFactory = Mirage.Factory.extend({
    bar: function() {
      return this.foo;
    },

    foo: function(i) {
      return this.bar;
    }
  });

  var b = new BazFactory();
  assert.throws(function() {
    b.build(1);
  }, function(e) {
    return e.toString() === 'Error: Cyclic dependency in properties ["foo","bar"]';
  });
});
