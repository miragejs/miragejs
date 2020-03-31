import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Has Many | One-way Polymorphic | create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    helper.schema.registerModel("foo", Model);
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      thingIds: [{ type: "post", id: post.id }],
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.models[0].attrs).toEqual(post.attrs);
    expect(helper.db.posts).toHaveLength(1);
    expect(helper.db.posts[0]).toEqual({ id: "1" });
    expect(helper.db.users).toHaveLength(1);
    expect(helper.db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }],
    });
  });

  test("it sets up associations correctly when passing in an array of models", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      things: [post],
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
    expect(helper.db.posts).toHaveLength(1);
    expect(helper.db.posts[0]).toEqual({ id: "1" });
    expect(helper.db.users).toHaveLength(1);
    expect(helper.db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }],
    });
  });

  test("it sets up associations correctly when passing in a collection", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      things: helper.schema.posts.all(),
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
    expect(helper.db.posts).toHaveLength(1);
    expect(helper.db.posts[0]).toEqual({ id: "1" });
    expect(helper.db.users).toHaveLength(1);
    expect(helper.db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }],
    });
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = helper;

    expect(function () {
      schema.create("user", {
        foo: schema.create("foo"),
      });
    }).toThrow();
  });

  test("it throws an error if an array of models is passed in without a defined relationship", () => {
    let { schema } = helper;

    expect(function () {
      schema.create("user", {
        foos: [schema.create("foo")],
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", () => {
    let { schema } = helper;
    schema.create("foo");
    schema.create("foo");

    expect(function () {
      schema.create("user", {
        foos: schema.foos.all(),
      });
    }).toThrow();
  });
});
