import Helper from "./_helper";
import { Model } from "@miragejs/server";

describe("Integration | ORM | Mixed | One To Many Polymorphic | create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", assert => {
    let post = this.helper.schema.create("post");
    let user = this.helper.schema.create("user", {
      thingIds: [{ type: "post", id: post.id }]
    });
    post.reload();

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
    expect(post.user.attrs).toEqual(user.attrs);

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }]
    });
  });

  test("it sets up associations correctly when passing in an array of models", assert => {
    let post = this.helper.schema.create("post");
    let user = this.helper.schema.create("user", {
      things: [post]
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
    expect(post.user.attrs).toEqual(user.attrs);

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }]
    });
  });

  test("it sets up associations correctly when passing in a collection", assert => {
    let post = this.helper.schema.create("post");
    let user = this.helper.schema.create("user", {
      things: this.helper.schema.posts.all()
    });
    post.reload();

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({
      id: "1",
      thingIds: [{ type: "post", id: "1" }]
    });
  });
});
