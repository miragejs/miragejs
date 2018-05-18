import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Regressions | pr-1312', function() {
  test(`creating and using a record with a polymorphic hasMany and explicit inverse does not fail when accessing the association`, function(assert) {
    let schema = new Schema(new Db(), {
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true, inverse: 'comments' })
      }),

      post: Model.extend({
        comments: hasMany('comment', { inverse: 'commentable' })
      })
    });

    let post = schema.posts.create();
    post.createComment();

    assert.equal(post.comments.models.length, 1);
  });
});
