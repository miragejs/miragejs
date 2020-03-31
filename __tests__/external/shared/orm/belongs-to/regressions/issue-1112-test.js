import { Server, Model, belongsTo, hasMany } from "miragejs";

describe("External | Shared | ORM | Belongs To | Regressions | Issue 1112", function () {
  test(`deleting a record with a polymorphic belongsTo doesn't interfere with other dependents`, () => {
    let server = new Server({
      environment: "test",
      models: {
        comment: Model.extend({
          commentable: belongsTo({ polymorphic: true }),
          user: belongsTo("user"),
        }),

        post: Model,

        user: Model.extend({
          comments: hasMany("comment"),
        }),
      },
    });

    let user = server.schema.users.create();
    let post = server.schema.posts.create();
    let comment = server.schema.comments.create({ commentable: post, user });

    comment.destroy();

    expect(user.reload().commentIds).toBeEmpty();
  });
});
