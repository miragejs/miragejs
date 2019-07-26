import { module, test } from 'qunit';
import { Model, Server, hasMany, belongsTo } from '@miragejs/server';

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

  test('it errors when passing in the wrong type for a HasMany association', assert => {
    expect(() => {
      this.server.schema.users.create({
        name: 'Sam',
        posts: [ 1 ]
      });
    }).toThrow();
  });

  test(`it doesn't error when passing in an empty array`, assert => {
    this.server.schema.users.create({
      name: 'Sam',
      posts: []
    });
    expect(true).toBeTruthy();
  });

  test('it errors when passing in the wrong type for a HasMany association foreign key', assert => {
    expect(() => {
      this.server.schema.users.create({
        name: 'Sam',
        postIds: 'foo'
      });
    }).toThrow();
  });

  test('it errors when passing in a missing foreign key for a HasMany association foreign key', assert => {
    expect(() => {
      this.server.schema.users.create({
        name: 'Sam',
        postIds: [ 2 ]
      });
    }).toThrow();
  });

  test('it errors when passing in the wrong type for a BelongsTo association', assert => {
    expect(() => {
      this.server.schema.posts.create({
        title: 'Post 1',
        author: 'sam'
      });
    }).toThrow();
  });

  test('it errors when passing in a missing foreign key for a BelongsTo association foreign key', assert => {
    expect(() => {
      this.server.schema.posts.create({
        title: 'Post 1',
        authorId: 1
      });
    }).toThrow();
  });

});
