import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let post = this.helper.schema.create('post');
  let user = this.helper.schema.create('user', {
    commentableIds: [ { type: 'post', id: post.id } ]
  });

  post.reload();

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(user.attrs.commentableIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
  assert.deepEqual(user.commentables.models[0].attrs, post.attrs);
  assert.equal(this.helper.db.posts.length, 1);
  assert.equal(this.helper.db.users.length, 1);
  assert.deepEqual(this.helper.db.posts[0], { id: '1', userIds: [ '1' ] });
  assert.deepEqual(this.helper.db.users[0], { id: '1', commentableIds: [ { type: 'post', id: '1' } ] });
});

test('it sets up associations correctly when passing in an array of models', function(assert) {
  let post = this.helper.schema.create('post');
  let user = this.helper.schema.create('user', {
    commentables: [ post ]
  });

  post.reload();

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(post.userIds, [ '1' ], 'the inverse was set');
  assert.deepEqual(user.attrs.commentableIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
  assert.deepEqual(post.attrs.userIds, [ user.id ], 'the inverse was set');
  assert.equal(this.helper.db.users.length, 1);
  assert.equal(this.helper.db.posts.length, 1);
});

test('it sets up associations correctly when passing in a collection', function(assert) {
  let post = this.helper.schema.create('post');
  let user = this.helper.schema.create('user', {
    commentables: this.helper.schema.posts.all()
  });

  post.reload();

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(post.userIds, [ user.id ], 'the inverse was set');
  assert.deepEqual(user.attrs.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(post.attrs.userIds, [ user.id ], 'the inverse was set');
  assert.equal(this.helper.db.users.length, 1);
  assert.equal(this.helper.db.posts.length, 1);
});
