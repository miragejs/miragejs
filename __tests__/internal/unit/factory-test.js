import Factory from "@lib/factory";
import trait from "@lib/trait";

describe("Unit | Factory", function () {
  test("it exists", () => {
    expect(Factory).toBeTruthy();
  });

  test("the base class builds empty objects", () => {
    let f = new Factory();
    let data = f.build();

    expect(data).toEqual({});
  });

  test("a noop extension builds empty objects", () => {
    let EmptyFactory = Factory.extend();
    let f = new EmptyFactory();
    let data = f.build();

    expect(data).toEqual({});
  });

  test("it works with strings, numbers and booleans", () => {
    let AFactory = Factory.extend({
      name: "Sam",
      age: 28,
      alive: true,
    });

    let f = new AFactory();
    let data = f.build();

    expect(data).toEqual({ name: "Sam", age: 28, alive: true });
  });

  test("it supports inheritance", () => {
    let PersonFactory = Factory.extend({
      species: "human",
    });
    let ManFactory = PersonFactory.extend({
      gender: "male",
    });
    let SamFactory = ManFactory.extend({
      name: "Sam",
    });

    let p = new PersonFactory();
    let m = new ManFactory();
    let s = new SamFactory();

    expect(p.build()).toEqual({ species: "human" });
    expect(m.build()).toEqual({ species: "human", gender: "male" });
    expect(s.build()).toEqual({
      species: "human",
      gender: "male",
      name: "Sam",
    });
  });

  test("it can use sequences", () => {
    let PostFactory = Factory.extend({
      likes(i) {
        return 5 * i;
      },
    });

    let p = new PostFactory();
    let post1 = p.build(1);
    let post2 = p.build(2);

    expect(post1).toEqual({ likes: 5 });
    expect(post2).toEqual({ likes: 10 });
  });

  test("it can reuse static properties", () => {
    let BazFactory = Factory.extend({
      foo: 5,
      bar(i) {
        return this.foo * i;
      },
    });

    let b = new BazFactory();
    let baz1 = b.build(1);
    let baz2 = b.build(2);

    expect(baz1).toEqual({ foo: 5, bar: 5 });
    expect(baz2).toEqual({ foo: 5, bar: 10 });
  });

  test("it can reuse dynamic properties", () => {
    let BazFactory = Factory.extend({
      foo(i) {
        return 5 * i;
      },
      bar() {
        return this.foo * 2;
      },
    });

    let b = new BazFactory();
    let baz1 = b.build(1);
    let baz2 = b.build(2);

    expect(baz1).toEqual({ foo: 5, bar: 10 });
    expect(baz2).toEqual({ foo: 10, bar: 20 });
  });

  test("it can have dynamic properties that depend on another", () => {
    let BazFactory = Factory.extend({
      name() {
        return "foo";
      },
      bar() {
        return this.name.substr(1);
      },
    });

    let b = new BazFactory();
    let baz1 = b.build(1);

    expect(baz1).toEqual({ name: "foo", bar: "oo" });
  });

  test("it can reference properties out of order", () => {
    let BazFactory = Factory.extend({
      bar() {
        return this.foo + 2;
      },

      baz: 6,

      foo(i) {
        return this.baz * i;
      },
    });

    let b = new BazFactory();
    let baz1 = b.build(1);
    let baz2 = b.build(2);

    expect(baz1).toEqual({ baz: 6, foo: 6, bar: 8 });
    expect(baz2).toEqual({ baz: 6, foo: 12, bar: 14 });
  });

  test("it can reference multiple properties in any order", () => {
    let FooFactory = Factory.extend({
      foo() {
        return this.bar + this.baz;
      },

      bar: 6,

      baz: 10,
    });

    let BarFactory = Factory.extend({
      bar: 6,

      foo() {
        return this.bar + this.baz;
      },

      baz: 10,
    });

    let BazFactory = Factory.extend({
      bar: 6,

      baz: 10,

      foo() {
        return this.bar + this.baz;
      },
    });

    let Foo = new FooFactory();
    let Bar = new BarFactory();
    let Baz = new BazFactory();

    let foo = Foo.build(1);
    let bar = Bar.build(1);
    let baz = Baz.build(1);

    expect(foo).toEqual({ foo: 16, bar: 6, baz: 10 });
    expect(bar).toEqual({ foo: 16, bar: 6, baz: 10 });
    expect(baz).toEqual({ foo: 16, bar: 6, baz: 10 });
  });

  test("it can reference properties on complex object", () => {
    let AbcFactory = Factory.extend({
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
      h: 3,
    });

    let b = new AbcFactory();
    let abc1 = b.build(1);
    let abc2 = b.build(2);

    expect(abc1).toEqual({ a: 4, b: 3, c: 2, d: 4, e: 3, f: 1, g: 2, h: 3 });
    expect(abc2).toEqual({ a: 5, b: 3, c: 2, d: 5, e: 3, f: 1, g: 2, h: 3 });
  });

  test("throws meaningfull exception on circular reference", () => {
    let BazFactory = Factory.extend({
      bar() {
        return this.foo;
      },

      foo() {
        return this.bar;
      },
    });

    let b = new BazFactory();
    expect(function () {
      b.build(1);
    }).toThrow();
  });

  test("#build skips invoking `afterCreate`", () => {
    let skipped = true;
    let PostFactory = Factory.extend({
      afterCreate() {
        skipped = false;
      },
    });

    let factory = new PostFactory();
    let post = factory.build(0);

    expect(skipped).toBeTruthy();
    expect(typeof post.afterCreate).toBe("undefined");
  });

  test("extractAfterCreateCallbacks returns all afterCreate callbacks from factory with the base one being first", () => {
    let PostFactory = Factory.extend({
      published: trait({
        afterCreate() {
          return "from published";
        },
      }),

      withComments: trait({
        afterCreate() {
          return "from withComments";
        },
      }),

      otherTrait: trait({}),

      afterCreate() {
        return "from base";
      },
    });

    let callbacks = PostFactory.extractAfterCreateCallbacks();
    expect(callbacks).toHaveLength(3);
    expect(callbacks.map((cb) => cb())).toEqual([
      "from base",
      "from published",
      "from withComments",
    ]);
  });

  test("extractAfterCreateCallbacks filters traits from which the afterCreate callbacks will be extracted from", () => {
    let PostFactory = Factory.extend({
      published: trait({
        afterCreate() {
          return "from published";
        },
      }),

      withComments: trait({
        afterCreate() {
          return "from withComments";
        },
      }),

      otherTrait: trait({}),

      afterCreate() {
        return "from base";
      },
    });

    expect(
      PostFactory.extractAfterCreateCallbacks({ traits: [] })
    ).toHaveLength(1);
    expect(
      PostFactory.extractAfterCreateCallbacks({ traits: [] }).map((cb) => cb())
    ).toEqual(["from base"]);

    expect(
      PostFactory.extractAfterCreateCallbacks({ traits: ["withComments"] })
    ).toHaveLength(2);
    expect(
      PostFactory.extractAfterCreateCallbacks({
        traits: ["withComments"],
      }).map((cb) => cb())
    ).toEqual(["from base", "from withComments"]);

    expect(
      PostFactory.extractAfterCreateCallbacks({
        traits: ["withComments", "published"],
      })
    ).toHaveLength(3);
    expect(
      PostFactory.extractAfterCreateCallbacks({
        traits: ["withComments", "published"],
      }).map((cb) => cb())
    ).toEqual(["from base", "from withComments", "from published"]);

    expect(
      PostFactory.extractAfterCreateCallbacks({
        traits: ["withComments", "otherTrait"],
      })
    ).toHaveLength(2);
    expect(
      PostFactory.extractAfterCreateCallbacks({
        traits: ["withComments", "otherTrait"],
      }).map((cb) => cb())
    ).toEqual(["from base", "from withComments"]);
  });

  test("isTrait returns true if there is a trait with given name", () => {
    let PostFactory = Factory.extend({
      title: "Lorem ipsum",

      published: trait({
        isPublished: true,
      }),

      someNestedObject: {
        value: "nested",
      },
    });

    expect(!PostFactory.isTrait("title")).toBeTruthy();
    expect(PostFactory.isTrait("published")).toBeTruthy();
    expect(!PostFactory.isTrait("someNestedObject")).toBeTruthy();
    expect(!PostFactory.isTrait("notdefined")).toBeTruthy();
  });
});
