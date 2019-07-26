import "../../../../../lib/container";
import Db from "../../../../../lib/db";
import Schema from "../../../../../lib/orm/schema";
import { Model, belongsTo } from "../../../../../lib/index";

describe("Integration | ORM | Belongs To | Basic | regressions", function() {
  test("belongsTo accessors works when foreign key is present but falsy", () => {
    let db = new Db({
      posts: [{ id: 1, authorId: 0, name: "some post" }],
      authors: [{ id: 0, name: "Foo" }]
    });

    let schema = new Schema(db, {
      author: Model.extend(),
      post: Model.extend({
        author: belongsTo()
      })
    });

    let post = schema.posts.find(1);
    expect(post.author.name).toEqual("Foo");
  });
});
