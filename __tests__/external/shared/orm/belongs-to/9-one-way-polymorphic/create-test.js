import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Belongs To | One-way Polymorphic | create", () => {
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
    let comment = helper.schema.create("comment", {
      commentableId: { id: post.id, type: "post" },
    });

    expect(comment.commentableId).toEqual({ id: post.id, type: "post" });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(helper.schema.db.posts).toHaveLength(1);
    expect(helper.schema.db.posts[0]).toEqual({ id: "1" });
    expect(helper.schema.db.comments).toHaveLength(1);
    expect(helper.schema.db.comments[0]).toEqual({
      id: "1",
      commentableId: { id: "1", type: "post" },
    });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let post = helper.schema.create("post");
    let comment = helper.schema.create("comment", {
      commentable: post,
    });

    expect(comment.commentableId).toEqual({ id: post.id, type: "post" });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(helper.schema.db.posts).toHaveLength(1);
    expect(helper.schema.db.posts[0]).toEqual({ id: "1" });
    expect(helper.schema.db.comments).toHaveLength(1);
    expect(helper.schema.db.comments[0]).toEqual({
      id: "1",
      commentableId: { id: "1", type: "post" },
    });
  });
});
