import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import { Model, belongsTo, hasMany } from "@miragejs/server";

describe("Integration | ORM | Belongs To | Regressions | pr-1312", function() {
  test(`creating and using a record with a polymorphic hasMany and explicit inverse does not fail when accessing the association`, () => {
    let schema = new Schema(new Db(), {
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true, inverse: "comments" })
      }),

      post: Model.extend({
        comments: hasMany("comment", { inverse: "commentable" })
      })
    });

    let post = schema.posts.create();
    post.createComment();

    expect(post.comments.models).toHaveLength(1);
  });
});
