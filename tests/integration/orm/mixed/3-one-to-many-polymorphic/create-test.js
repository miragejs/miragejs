import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many Polymorphic | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', function(assert) {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      thingIds: [ { type: 'post', id: post.id } ]
    });
    post.reload();

    assert.deepEqual(user.thingIds, [ { type: 'post', id: post.id } ]);
    assert.deepEqual(user.attrs.thingIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
    assert.ok(user.things.includes(post));
    assert.deepEqual(post.user.attrs, user.attrs);

    let { db } = this.helper;
    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], { id: '1', userId: '1' });
    assert.equal(db.users.length, 1);
    assert.deepEqual(db.users[0], { id: '1', thingIds: [ { type: 'post', id: '1' } ] });
  });

  test('it sets up associations correctly when passing in an array of models', function(assert) {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      things: [ post ]
    });

    assert.deepEqual(user.thingIds, [ { type: 'post', id: post.id } ]);
    assert.deepEqual(user.attrs.thingIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
    assert.ok(user.things.includes(post));
    assert.deepEqual(post.user.attrs, user.attrs);

    let { db } = this.helper;
    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], { id: '1', userId: '1' });
    assert.equal(db.users.length, 1);
    assert.deepEqual(db.users[0], { id: '1', thingIds: [ { type: 'post', id: '1' } ] });
  });

  test('it sets up associations correctly when passing in a collection', function(assert) {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      things: this.helper.schema.posts.all()
    });
    post.reload();

    assert.deepEqual(user.thingIds, [ { type: 'post', id: post.id } ]);
    assert.deepEqual(user.attrs.thingIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
    assert.ok(user.things.includes(post));

    let { db } = this.helper;
    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], { id: '1', userId: '1' });
    assert.equal(db.users.length, 1);
    assert.deepEqual(db.users[0], { id: '1', thingIds: [ { type: 'post', id: '1' } ] });
  });
});
