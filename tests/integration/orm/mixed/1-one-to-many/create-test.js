import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', function(assert) {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      postIds: [ post.id ]
    });
    post.reload();

    assert.deepEqual(user.postIds, [ post.id ]);
    assert.deepEqual(user.attrs.postIds, [ post.id ], 'the ids were persisted');
    assert.ok(user.posts.includes(post));
    assert.deepEqual(post.user.attrs, user.attrs);

    let { db } = this.helper;
    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], { id: '1', userId: '1' });
    assert.equal(db.users.length, 1);
    assert.deepEqual(db.users[0], { id: '1', postIds: [ '1' ] });
  });

  test('it sets up associations correctly when passing in an array of models', function(assert) {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      posts: [ post ]
    });

    assert.deepEqual(user.postIds, [ post.id ]);
    assert.deepEqual(user.attrs.postIds, [ post.id ], 'the ids were persisted');
    assert.ok(user.posts.includes(post));
    assert.deepEqual(post.user.attrs, user.attrs);

    let { db } = this.helper;
    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], { id: '1', userId: '1' });
    assert.equal(db.users.length, 1);
    assert.deepEqual(db.users[0], { id: '1', postIds: [ '1' ] });
  });

  test('it sets up associations correctly when passing in a collection', function(assert) {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      posts: this.helper.schema.posts.all()
    });
    post.reload();

    assert.deepEqual(user.postIds, [ post.id ]);
    assert.deepEqual(user.attrs.postIds, [ post.id ], 'the ids were persisted');
    assert.ok(user.posts.includes(post));

    let { db } = this.helper;
    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], { id: '1', userId: '1' });
    assert.equal(db.users.length, 1);
    assert.deepEqual(db.users[0], { id: '1', postIds: [ '1' ] });
  });

  test('it throws an error if a model is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.create('user', {
        foo: schema.create('foo')
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if an array of models is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.create('user', {
        foos: [ schema.create('foo') ]
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;
    schema.create('foo');
    schema.create('foo');

    assert.throws(function() {
      schema.create('post', {
        foos: schema.foos.all()
      });
    }, /you haven't defined that key as an association on your model/);
  });
});
