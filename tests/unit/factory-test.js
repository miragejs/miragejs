import Mirage from 'ember-cli-mirage';

import {module, test} from 'qunit';

module('Unit | Factory');

test('it exists', function(assert) {
  assert.ok(Mirage.Factory);
});

test('the base class builds empty objects', function(assert) {
  let f = new Mirage.Factory();
  let data = f.build();

  assert.deepEqual(data, {});
});

test('a noop extension builds empty objects', function(assert) {
  let EmptyFactory = Mirage.Factory.extend();
  let f = new EmptyFactory();
  let data = f.build();

  assert.deepEqual(data, {});
});

test('it works with strings, numbers and booleans', function(assert) {
  let AFactory = Mirage.Factory.extend({
    name: 'Sam',
    age: 28,
    alive: true
  });

  let f = new AFactory();
  let data = f.build();

  assert.deepEqual(data, { name: 'Sam', age: 28, alive: true });
});

test('it supports inheritance', function(assert) {
  let PersonFactory = Mirage.Factory.extend({
    species: 'human'
  });
  let ManFactory = PersonFactory.extend({
    gender: 'male'
  });
  let SamFactory = ManFactory.extend({
    name: 'Sam'
  });

  let p = new PersonFactory();
  let m = new ManFactory();
  let s = new SamFactory();

  assert.deepEqual(p.build(), { species: 'human' });
  assert.deepEqual(m.build(), { species: 'human', gender: 'male' });
  assert.deepEqual(s.build(), { species: 'human', gender: 'male', name: 'Sam' });
});

test('it can use sequences', function(assert) {
  let PostFactory = Mirage.Factory.extend({
    likes(i) {
      return 5 * i;
    }
  });

  let p = new PostFactory();
  let post1 = p.build(1);
  let post2 = p.build(2);

  assert.deepEqual(post1, { likes: 5 });
  assert.deepEqual(post2, { likes: 10 });
});

test('it can reuse static properties', function(assert) {
  let BazFactory = Mirage.Factory.extend({
    foo: 5,
    bar(i) {
      return this.foo * i;
    }
  });

  let b = new BazFactory();
  let baz1 = b.build(1);
  let baz2 = b.build(2);

  assert.deepEqual(baz1, { foo: 5, bar: 5 });
  assert.deepEqual(baz2, { foo: 5, bar: 10 });
});

test('it can reuse dynamic properties', function(assert) {
  let BazFactory = Mirage.Factory.extend({
    foo(i) {
      return 5 * i;
    },
    bar() {
      return this.foo * 2;
    }
  });

  let b = new BazFactory();
  let baz1 = b.build(1);
  let baz2 = b.build(2);

  assert.deepEqual(baz1, { foo: 5, bar: 10 });
  assert.deepEqual(baz2, { foo: 10, bar: 20 });
});

test('it can reference properties out of order', function(assert) {
  let BazFactory = Mirage.Factory.extend({
    bar() {
      return this.foo + 2;
    },

    baz: 6,

    foo(i) {
      return this.baz * i;
    }
  });

  let b = new BazFactory();
  let baz1 = b.build(1);
  let baz2 = b.build(2);

  assert.deepEqual(baz1, { baz: 6, foo: 6, bar: 8 });
  assert.deepEqual(baz2, { baz: 6, foo: 12, bar: 14 });
});

test('it can reference multiple properties in any order', function(assert) {
  let FooFactory = Mirage.Factory.extend({
    foo() {
      return this.bar + this.baz;
    },

    bar: 6,

    baz: 10
  });

  let BarFactory = Mirage.Factory.extend({
    bar: 6,

    foo() {
      return this.bar + this.baz;
    },

    baz: 10
  });

  let BazFactory = Mirage.Factory.extend({
    bar: 6,

    baz: 10,

    foo() {
      return this.bar + this.baz;
    }
  });

  let Foo = new FooFactory();
  let Bar = new BarFactory();
  let Baz = new BazFactory();

  let foo = Foo.build(1);
  let bar = Bar.build(1);
  let baz = Baz.build(1);

  assert.deepEqual(foo, { foo: 16, bar: 6, baz: 10 });
  assert.deepEqual(bar, { foo: 16, bar: 6, baz: 10 });
  assert.deepEqual(baz, { foo: 16, bar: 6, baz: 10 });
});

test('it can reference properties on complex object', function(assert) {
  let AbcFactory = Mirage.Factory.extend({
    a(i) {
      return this.b + i;
    },
    b() {
      return this.c + 1;
    },
    c() {
      return this.f + 1;
    },
    d(i) {
      return this.e + i;
    },
    e() {
      return this.c + 1;
    },
    f: 1,
    g: 2,
    h: 3
  });

  let b = new AbcFactory();
  let abc1 = b.build(1);
  let abc2 = b.build(2);

  assert.deepEqual(abc1, { a: 4, b: 3, c: 2, d: 4, e: 3, f: 1, g: 2, h: 3 });
  assert.deepEqual(abc2, { a: 5, b: 3, c: 2, d: 5, e: 3, f: 1, g: 2, h: 3 });
});

test('throws meaningfull exception on circular reference', function(assert) {
  let BazFactory = Mirage.Factory.extend({
    bar() {
      return this.foo;
    },

    foo(i) {
      return this.bar;
    }
  });

  let b = new BazFactory();
  assert.throws(function() {
    b.build(1);
  }, function(e) {
    return e.toString() === 'Error: Cyclic dependency in properties ["foo","bar"]';
  });
});

test('#build skips invoking `afterCreate`', function(assert) {
  let skipped = true;
  let PostFactory = Mirage.Factory.extend({
    afterCreate() {
      skipped = false;
    }
  });

  let factory = new PostFactory();
  let post = factory.build(0);

  assert.ok(skipped, 'skips invoking `afterCreate`');
  assert.equal(
    typeof post.afterCreate,
    'undefined',
    'does not build `afterCreate` attribute'
  );
});
