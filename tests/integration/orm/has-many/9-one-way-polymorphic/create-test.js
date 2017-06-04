import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-way Polymorphic | create', {
  beforeEach() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let post = this.helper.schema.create('post');
  let user = this.helper.schema.create('user', {
    thingIds: [ { type: 'post', id: post.id } ]
  });

  assert.deepEqual(user.thingIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(user.attrs.thingIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
  assert.deepEqual(user.things.models[0].attrs, post.attrs);
  assert.equal(this.helper.db.posts.length, 1);
  assert.deepEqual(this.helper.db.posts[0], { id: '1' });
  assert.equal(this.helper.db.users.length, 1);
  assert.deepEqual(this.helper.db.users[0], { id: '1', thingIds: [ { type: 'post', id: '1' } ] });
});

test('it sets up associations correctly when passing in an array of models', function(assert) {
  let post = this.helper.schema.create('post');
  let user = this.helper.schema.create('user', {
    things: [ post ]
  });

  assert.deepEqual(user.thingIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(user.attrs.thingIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
  assert.ok(user.things.includes(post));
  assert.equal(this.helper.db.posts.length, 1);
  assert.deepEqual(this.helper.db.posts[0], { id: '1' });
  assert.equal(this.helper.db.users.length, 1);
  assert.deepEqual(this.helper.db.users[0], { id: '1', thingIds: [ { type: 'post', id: '1' } ] });
});

test('it sets up associations correctly when passing in a collection', function(assert) {
  let post = this.helper.schema.create('post');
  let user = this.helper.schema.create('user', {
    things: this.helper.schema.posts.all()
  });

  assert.deepEqual(user.thingIds, [ { type: 'post', id: post.id } ]);
  assert.deepEqual(user.attrs.thingIds, [ { type: 'post', id: post.id } ], 'the ids were persisted');
  assert.ok(user.things.includes(post));
  assert.equal(this.helper.db.posts.length, 1);
  assert.deepEqual(this.helper.db.posts[0], { id: '1' });
  assert.equal(this.helper.db.users.length, 1);
  assert.deepEqual(this.helper.db.users[0], { id: '1', thingIds: [ { type: 'post', id: '1' } ] });
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
    schema.create('user', {
      foos: schema.foos.all()
    });
  }, /you haven't defined that key as an association on your model/);
});
