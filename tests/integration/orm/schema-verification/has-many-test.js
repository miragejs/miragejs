import { Model, hasMany } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Has Many');

test('a one-way has many association is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ],
    posts: [
      { id: 1, title: 'Lorem' }
    ]
  }), {
    user: Model.extend({
      posts: hasMany()
    }),
    post: Model.extend()
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('posts');

  assert.equal(association.key, 'posts');
  assert.equal(association.modelName, 'post');
  assert.equal(association.ownerModelName, 'user');

  let post = schema.posts.find(1);

  assert.ok(post.inverseFor(association) === null, 'there is no inverse');
});

test('a named one-way has many association is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ],
    posts: [
      { id: 1, title: 'Lorem' }
    ]
  }), {
    user: Model.extend({
      blogPosts: hasMany('post')
    }),
    post: Model.extend()
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('blogPosts');

  assert.equal(association.key, 'blogPosts');
  assert.equal(association.modelName, 'post');
  assert.equal(association.ownerModelName, 'user');

  let post = schema.posts.find(1);

  assert.ok(post.inverseFor(association) === null, 'there is no inverse');
});

test('a reflexive hasMany association with an implicit inverse is correct', function(assert) {
  let schema = new Schema(new Db({
    tags: [
      { id: 1, name: 'economics' }
    ]
  }), {
    tag: Model.extend({
      tags: hasMany()
    })
  });

  let tag = schema.tags.find(1);
  let association = tag.associationFor('tags');

  assert.equal(association.key, 'tags');
  assert.equal(association.modelName, 'tag');
  assert.equal(association.ownerModelName, 'tag');

  assert.ok(tag.inverseFor(association) === association, 'the implicit inverse was found');
});
