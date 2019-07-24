import { Model, belongsTo, _ormSchema as Schema, _Db as Db } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | regressions', function() {
  test('belongsTo accessors works when foreign key is present but falsy', function(assert) {
    let db = new Db({
      posts: [
        { id: 1, authorId: 0, name: 'some post' }
      ],
      authors: [
        { id: 0, name: 'Foo' }
      ]
    });

    let schema = new Schema(db, {
      author: Model.extend(),
      post: Model.extend({
        author: belongsTo()
      })
    });

    let post = schema.posts.find(1);
    assert.equal(post.author.name, 'Foo');
  });
});
