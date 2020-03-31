import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Mixed | Many To One | create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    helper.schema.registerModel("foo", Model);
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let { schema } = helper;
    let user = schema.create("user");
    let post = schema.create("post", {
      userId: user.id,
    });
    user.reload();

    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.userId).toEqual(user.id);
    expect(user.posts.includes(post)).toBeTruthy();
    expect(user.postIds).toEqual([post.id]);

    let { db } = helper;
    expect(db.posts).toHaveLength(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users).toHaveLength(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let { schema } = helper;
    let user = schema.create("user");
    let post = schema.create("post", {
      user,
    });

    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.userId).toEqual(user.id);
    expect(user.posts.includes(post)).toBeTruthy();
    expect(user.postIds).toEqual([post.id]);

    let { db } = helper;
    expect(db.posts).toHaveLength(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users).toHaveLength(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = helper;

    expect(function () {
      schema.create("post", {
        foo: schema.create("foo"),
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", () => {
    let { schema } = helper;
    schema.create("foo");
    schema.create("foo");

    expect(function () {
      schema.create("post", {
        foos: schema.foos.all(),
      });
    }).toThrow();
  });
});
