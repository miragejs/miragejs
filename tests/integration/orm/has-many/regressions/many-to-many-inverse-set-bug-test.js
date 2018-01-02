import { module, test } from 'qunit';
import { Model, hasMany } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';

module('Integration | ORM | Has Many | Regressions | Many to many inverse set bug', function(hooks) {
  hooks.beforeEach(function() {
    this.db = new Db();

    this.schema = new Schema(this.db, {
      post: Model.extend({
        tags: hasMany()
      }),
      tag: Model.extend({
        posts: hasMany()
      })
    });
  });

  test(`it works`, function(assert) {
    this.db.loadData({
      posts: [
        { id: '1', tagIds: [ '15', '16' ] },
        { id: '2', tagIds: [ '16' ] }
      ],
      tags: [
        { id: '15', postIds: [ '1' ] },
        { id: '16', postIds: [ '1', '2' ] }
      ]
    });

    this.schema.posts.find(1).update({ tagIds: [ '15' ] });

    assert.deepEqual(this.db.posts.find(1).tagIds, [ '15' ]);
    assert.deepEqual(this.db.tags.find(15).postIds, [ '1' ]);
    assert.deepEqual(this.db.tags.find(16).postIds, [ '2' ]);
  });
});
