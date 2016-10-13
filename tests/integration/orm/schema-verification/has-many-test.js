import { Model, hasMany } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Has Many');

test('a one-way has many association is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      posts: hasMany()
    }),
    post: Model.extend()
  });

  let association = schema.modelClassFor('user').associationFor('posts');

  assert.equal(association.key, 'posts');
  assert.equal(association.modelName, 'post');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === null, 'there is no inverse');
});

test('a named one-way has many association is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      blogPosts: hasMany('post')
    }),
    post: Model.extend()
  });

  let association = schema.modelClassFor('user').associationFor('blogPosts');

  assert.equal(association.key, 'blogPosts');
  assert.equal(association.modelName, 'post');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === null, 'there is no inverse');
});

test('a reflexive hasMany association with an implicit inverse is correct', function(assert) {
  let schema = new Schema(new Db(), {
    tag: Model.extend({
      tags: hasMany()
    })
  });

  let association = schema.modelClassFor('tag').associationFor('tags');

  assert.equal(association.key, 'tags');
  assert.equal(association.modelName, 'tag');
  assert.equal(association.ownerModelName, 'tag');
  assert.ok(association.inverse() === association, 'the implicit inverse was found');
});
