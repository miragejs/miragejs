import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import { Model, hasMany, belongsTo } from "@miragejs/server";

describe("Integration | ORM | Mixed | Regressions | 1613 Two bidirectional one-to-many relationships with same target model update ids bug", () => {
  let db, schema;

  beforeEach(() => {
    db = new Db();

    schema = new Schema(db, {
      user: Model.extend({
        authoredPosts: hasMany("post", { inverse: "author" }),
        editedPosts: hasMany("post", { inverse: "editor" })
      }),
      post: Model.extend({
        author: belongsTo("user", { inverse: "authoredPosts" }),
        editor: belongsTo("user", { inverse: "editedPosts" })
      })
    });
  });

  test(`it works, and all inverses are correctly updated`, () => {
    let user = schema.users.create();
    let post = schema.posts.create();

    post.update({
      authorId: user.id,
      editorId: user.id
    });

    expect(db.posts.find(1)).toEqual({
      id: "1",
      authorId: "1",
      editorId: "1"
    });
    expect(db.users.find(1)).toEqual({
      id: "1",
      authoredPostIds: ["1"],
      editedPostIds: ["1"]
    });
  });
});
