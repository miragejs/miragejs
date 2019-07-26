import { Model, belongsTo, hasMany, _ormSchema as Schema, _Db as Db } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Regressions | Issue 1112', function() {
  test(`deleting a record with a polymorphic belongsTo doesn't interfere with other dependents`, function(assert) {
    let schema = new Schema(new Db(), {
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true }),
        user: belongsTo('user')
      }),

      post: Model,

      user: Model.extend({
        comments: hasMany('comment')
      })
    });

    let user = schema.users.create();
    let post = schema.posts.create();
    let comment = schema.comments.create({ commentable: post, user });

    comment.destroy();

    assert.deepEqual(user.reload().commentIds, []);
  });
});
