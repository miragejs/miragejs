import Helper from "./_helper";
import { Model } from "@miragejs/server";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | create", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let { schema } = this.helper;
    let post = schema.create("post");
    let comment = schema.create("comment", {
      commentableId: { type: "post", id: post.id }
    });
    post.reload();

    expect(comment.commentableId).toEqual({ type: "post", id: post.id });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(post.comment.attrs).toEqual(comment.attrs);
    expect(schema.db.comments.length).toEqual(1);
    expect(schema.db.posts.length).toEqual(1);
    expect(schema.db.comments[0]).toEqual({
      id: "1",
      commentableId: { type: "post", id: "1" }
    });
    expect(schema.db.posts[0]).toEqual({ id: "1", commentId: "1" });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let { schema } = this.helper;
    let post = schema.create("post");
    let comment = schema.create("comment", {
      commentable: post
    });

    expect(comment.commentableId).toEqual({ type: "post", id: post.id });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(post.comment.attrs).toEqual(comment.attrs);
    expect(schema.db.comments.length).toEqual(1);
    expect(schema.db.posts.length).toEqual(1);
    expect(schema.db.comments[0]).toEqual({
      id: "1",
      commentableId: { type: "post", id: "1" }
    });
    expect(schema.db.posts[0]).toEqual({ id: "1", commentId: "1" });
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = this.helper;

    expect(function() {
      schema.create("comment", {
        foo: schema.create("foo")
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", () => {
    let { schema } = this.helper;
    schema.create("foo");
    schema.create("foo");

    expect(function() {
      schema.create("comment", {
        foos: schema.foos.all()
      });
    }).toThrow();
  });
});
