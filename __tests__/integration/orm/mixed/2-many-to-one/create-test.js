import Helper from "./_helper";
import { Model } from "@miragejs/server";

describe("Integration | ORM | Mixed | Many To One | create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let { schema } = this.helper;
    let user = schema.create("user");
    let post = schema.create("post", {
      userId: user.id
    });
    user.reload();

    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.userId).toEqual(user.id);
    expect(user.posts.includes(post)).toBeTruthy();
    expect(user.postIds).toEqual([post.id]);

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let { schema } = this.helper;
    let user = schema.create("user");
    let post = schema.create("post", {
      user
    });

    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.userId).toEqual(user.id);
    expect(user.posts.includes(post)).toBeTruthy();
    expect(user.postIds).toEqual([post.id]);

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = this.helper;

    expect(function() {
      schema.create("post", {
        foo: schema.create("foo")
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", () => {
    let { schema } = this.helper;
    schema.create("foo");
    schema.create("foo");

    expect(function() {
      schema.create("post", {
        foos: schema.foos.all()
      });
    }).toThrow();
  });
});
