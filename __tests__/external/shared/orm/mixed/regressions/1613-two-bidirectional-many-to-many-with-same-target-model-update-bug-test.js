import { Server, Model, hasMany, belongsTo } from "miragejs";

describe("External | Shared | ORM | Mixed | Regressions | 1613 Two bidirectional one-to-many relationships with same target model update ids bug", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model.extend({
          authoredPosts: hasMany("post", { inverse: "author" }),
          editedPosts: hasMany("post", { inverse: "editor" }),
        }),
        post: Model.extend({
          author: belongsTo("user", { inverse: "authoredPosts" }),
          editor: belongsTo("user", { inverse: "editedPosts" }),
        }),
      },
    });
  });

  test(`it works, and all inverses are correctly updated`, () => {
    let user = server.schema.users.create();
    let post = server.schema.posts.create();

    post.update({
      authorId: user.id,
      editorId: user.id,
    });

    expect(server.db.posts.find(1)).toEqual({
      id: "1",
      authorId: "1",
      editorId: "1",
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      authoredPostIds: ["1"],
      editedPostIds: ["1"],
    });
  });
});
