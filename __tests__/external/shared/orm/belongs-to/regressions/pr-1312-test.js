import { Server, Model, belongsTo, hasMany } from "miragejs";

describe("External | Shared | ORM | Belongs To | Regressions | pr-1312", function () {
  test(`creating and using a record with a polymorphic hasMany and explicit inverse does not fail when accessing the association`, () => {
    let server = new Server({
      environment: "test",
      models: {
        comment: Model.extend({
          commentable: belongsTo({ polymorphic: true, inverse: "comments" }),
        }),

        post: Model.extend({
          comments: hasMany("comment", { inverse: "commentable" }),
        }),
      },
    });

    let post = server.schema.posts.create();
    post.createComment();

    expect(post.comments.models).toHaveLength(1);
  });
});
