import Helper from "./_helper";
import { Model } from "@miragejs/server";

describe("Integration | ORM | Belongs To | Basic | create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let author = this.helper.schema.create("author");
    let post = this.helper.schema.create("post", {
      authorId: author.id
    });

    expect(post.authorId).toEqual(author.id);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(this.helper.schema.db.authors.length).toEqual(1);
    expect(this.helper.schema.db.authors[0]).toEqual({ id: "1" });
    expect(this.helper.schema.db.posts.length).toEqual(1);
    expect(this.helper.schema.db.posts[0]).toEqual({ id: "1", authorId: "1" });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let author = this.helper.schema.create("author");
    let post = this.helper.schema.create("post", {
      author
    });

    expect(post.authorId).toEqual(author.id);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(this.helper.schema.db.authors.length).toEqual(1);
    expect(this.helper.schema.db.authors[0]).toEqual({ id: "1" });
    expect(this.helper.schema.db.posts.length).toEqual(1);
    expect(this.helper.schema.db.posts[0]).toEqual({ id: "1", authorId: "1" });
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
