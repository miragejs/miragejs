import Helper from "./_helper";
import { Model } from "@miragejs/server";

describe("Integration | ORM | Mixed | One To Many | create", () => {
  beforeEach(() => {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let post = this.helper.schema.create("post");
    let user = this.helper.schema.create("user", {
      postIds: [post.id]
    });
    post.reload();

    expect(user.postIds).toEqual([post.id]);
    expect(user.attrs.postIds).toEqual([post.id]);
    expect(user.posts.includes(post)).toBeTruthy();
    expect(post.user.attrs).toEqual(user.attrs);

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it sets up associations correctly when passing in an array of models", () => {
    let post = this.helper.schema.create("post");
    let user = this.helper.schema.create("user", {
      posts: [post]
    });

    expect(user.postIds).toEqual([post.id]);
    expect(user.attrs.postIds).toEqual([post.id]);
    expect(user.posts.includes(post)).toBeTruthy();
    expect(post.user.attrs).toEqual(user.attrs);

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it sets up associations correctly when passing in a collection", () => {
    let post = this.helper.schema.create("post");
    let user = this.helper.schema.create("user", {
      posts: this.helper.schema.posts.all()
    });
    post.reload();

    expect(user.postIds).toEqual([post.id]);
    expect(user.attrs.postIds).toEqual([post.id]);
    expect(user.posts.includes(post)).toBeTruthy();

    let { db } = this.helper;
    expect(db.posts.length).toEqual(1);
    expect(db.posts[0]).toEqual({ id: "1", userId: "1" });
    expect(db.users.length).toEqual(1);
    expect(db.users[0]).toEqual({ id: "1", postIds: ["1"] });
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = this.helper;

    expect(function() {
      schema.create("user", {
        foo: schema.create("foo")
      });
    }).toThrow();
  });

  test("it throws an error if an array of models is passed in without a defined relationship", () => {
    let { schema } = this.helper;

    expect(function() {
      schema.create("user", {
        foos: [schema.create("foo")]
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
