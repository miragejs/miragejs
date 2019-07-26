import {
  Model,
  hasMany,
  belongsTo,
  _Db as Db,
  _ormSchema as Schema
} from "@miragejs/server";

describe("Integration | ORM | Mixed | Regressions | 1613 Two bidirectional one-to-many relationships with same target model update ids bug", () => {
  beforeEach(() => {
    this.db = new Db();

    this.schema = new Schema(this.db, {
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
    let user = this.schema.users.create();
    let post = this.schema.posts.create();

    post.update({
      authorId: user.id,
      editorId: user.id
    });

    expect(this.db.posts.find(1)).toEqual({
      id: "1",
      authorId: "1",
      editorId: "1"
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      authoredPostIds: ["1"],
      editedPostIds: ["1"]
    });
  });
});
