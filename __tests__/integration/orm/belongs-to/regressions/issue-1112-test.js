import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import { Model, belongsTo, hasMany } from "@miragejs/server";

describe("Integration | ORM | Belongs To | Regressions | Issue 1112", function() {
  test(`deleting a record with a polymorphic belongsTo doesn't interfere with other dependents`, () => {
    let schema = new Schema(new Db(), {
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true }),
        user: belongsTo("user")
      }),

      post: Model,

      user: Model.extend({
        comments: hasMany("comment")
      })
    });

    let user = schema.users.create();
    let post = schema.posts.create();
    let comment = schema.comments.create({ commentable: post, user });

    comment.destroy();

    expect(user.reload().commentIds).toBeEmpty();
  });
});
