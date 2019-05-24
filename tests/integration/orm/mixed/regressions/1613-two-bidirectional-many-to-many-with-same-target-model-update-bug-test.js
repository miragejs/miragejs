import { module, test } from 'qunit';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';

module('Integration | ORM | Mixed | Regressions | 1613 Two bidirectional one-to-many relationships with same target model update ids bug', function(hooks) {
  hooks.beforeEach(function() {
    this.db = new Db();

    this.schema = new Schema(this.db, {
      user: Model.extend({
        authoredPosts: hasMany('post', { inverse: 'author' }),
        editedPosts: hasMany('post', { inverse: 'editor' })
      }),
      post: Model.extend({
        author: belongsTo('user', { inverse: 'authoredPosts' }),
        editor: belongsTo('user', { inverse: 'editedPosts' })
      })
    });
  });

  test(`it works, and all inverses are correctly updated`, function(assert) {
    let user = this.schema.users.create();
    let post = this.schema.posts.create();

    post.update({
      authorId: user.id,
      editorId: user.id
    });

    assert.deepEqual(this.db.posts.find(1), { id: '1', authorId: '1', editorId: '1' });
    assert.deepEqual(this.db.users.find(1), { id: '1', authoredPostIds: [ '1' ], editedPostIds: [ '1' ] });
  });
});
