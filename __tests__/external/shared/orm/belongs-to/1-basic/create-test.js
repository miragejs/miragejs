import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Belongs To | Basic | create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    helper.schema.registerModel("foo", Model);
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let author = helper.schema.create("author");
    let post = helper.schema.create("post", {
      authorId: author.id,
    });

    expect(post.authorId).toEqual(author.id);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(helper.schema.db.authors).toHaveLength(1);
    expect(helper.schema.db.authors[0]).toEqual({ id: "1" });
    expect(helper.schema.db.posts).toHaveLength(1);
    expect(helper.schema.db.posts[0]).toEqual({ id: "1", authorId: "1" });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let author = helper.schema.create("author");
    let post = helper.schema.create("post", {
      author,
    });

    expect(post.authorId).toEqual(author.id);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(helper.schema.db.authors).toHaveLength(1);
    expect(helper.schema.db.authors[0]).toEqual({ id: "1" });
    expect(helper.schema.db.posts).toHaveLength(1);
    expect(helper.schema.db.posts[0]).toEqual({ id: "1", authorId: "1" });
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
