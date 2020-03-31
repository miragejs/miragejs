import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Mixed | One To Many Polymorphic | create", () => {
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
    post.reload();

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
    expect(post.user.attrs).toEqual(user.attrs);

    let { db } = helper;
    expect(db.posts).toHaveLength(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users).toHaveLength(1);
    expect(db.users[0]).toEqual({
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
    expect(post.user.attrs).toEqual(user.attrs);

    let { db } = helper;
    expect(db.posts).toHaveLength(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users).toHaveLength(1);
    expect(db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }],
    });
  });

  test("it sets up associations correctly when passing in a collection", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      things: helper.schema.posts.all(),
    });
    post.reload();

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();

    let { db } = helper;
    expect(db.posts).toHaveLength(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users).toHaveLength(1);
    expect(db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }],
    });
  });
});
