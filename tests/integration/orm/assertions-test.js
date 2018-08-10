import { module, test } from 'qunit';
import Server from 'ember-cli-mirage/server';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

module('Integration | ORM | assertions', function(hooks) {

  hooks.beforeEach(function() {
    this.server = new Server({
      models: {
        user: Model.extend({
          posts: hasMany()
        }),
        post: Model.extend({
          author: belongsTo('user')
        })
      }
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it errors when passing in the wrong type for a HasMany association', function(assert) {
    assert.throws(() => {
      this.server.schema.users.create({
        name: 'Sam',
        posts: [ 1 ]
      });
    }, /You're trying to create a user model and you passed in "1" under the posts key, but that key is a HasMany relationship./);
  });

  test(`it doesn't error when passing in an empty array`, function(assert) {
    this.server.schema.users.create({
      name: 'Sam',
      posts: []
    });
    assert.ok(true);
  });

  test('it errors when passing in the wrong type for a HasMany association foreign key', function(assert) {
    assert.throws(() => {
      this.server.schema.users.create({
        name: 'Sam',
        postIds: 'foo'
      });
    }, /You're trying to create a user model and you passed in "foo" under the postIds key, but that key is a foreign key for a HasMany relationship./);
  });

  test('it errors when passing in a missing foreign key for a HasMany association foreign key', function(assert) {
    assert.throws(() => {
      this.server.schema.users.create({
        name: 'Sam',
        postIds: [ 2 ]
      });
    }, /You're instantiating a user that has a postIds of 2, but some of those records don't exist in the database/);
  });

  test('it errors when passing in the wrong type for a BelongsTo association', function(assert) {
    assert.throws(() => {
      this.server.schema.posts.create({
        title: 'Post 1',
        author: 'sam'
      });
    }, /You're trying to create a post model and you passed in "sam" under the author key, but that key is a BelongsTo relationship./);
  });

  test('it errors when passing in a missing foreign key for a BelongsTo association foreign key', function(assert) {
    assert.throws(() => {
      this.server.schema.posts.create({
        title: 'Post 1',
        authorId: 1
      });
    }, /You're instantiating a post that has a authorId of 1, but that record doesn't exist in the database/);
  });

});
