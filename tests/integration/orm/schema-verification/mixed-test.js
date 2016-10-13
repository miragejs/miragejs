import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Mixed');

test('unnamed one-to-many associations are correct', function(assert) {
  let schema = new Schema(new Db(), {
    wordSmith: Model.extend({
      blogPosts: hasMany()
    }),
    blogPost: Model.extend({
      wordSmith: belongsTo()
    })
  });

  let association = schema.associationsFor('word-smith').blogPosts;
  let inverse = schema.associationsFor('blog-post').wordSmith;

  assert.equal(association.key, 'blogPosts');
  assert.equal(association.modelName, 'blog-post');
  assert.equal(association.ownerModelName, 'word-smith');
  assert.deepEqual(association.inverse(), inverse);
});

test('a named one-to-many association is correct', function(assert) {
  let schema = new Schema(new Db(), {
    wordSmith: Model.extend({
      posts: hasMany('blog-post')
    }),
    blogPost: Model.extend({
      author: belongsTo('word-smith')
    })
  });

  let association = schema.associationsFor('word-smith').posts;
  let inverse = schema.associationsFor('blog-post').author;

  assert.equal(association.key, 'posts');
  assert.equal(association.modelName, 'blog-post');
  assert.equal(association.ownerModelName, 'word-smith');
  assert.deepEqual(association.inverse(), inverse);
});

test('multiple has-many associations of the same type', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      notes: hasMany('post', { inverse: 'author' }),
      messages: hasMany('post', { inverse: 'messenger' })
    }),
    post: Model.extend({
      author: belongsTo('user', { inverse: 'notes' }),
      messenger: belongsTo('user', { inverse: 'messages' })
    })
  });

  let { notes, messages } = schema.associationsFor('user');
  let { author, messenger } = schema.associationsFor('post');

  assert.equal(notes.key, 'notes');
  assert.equal(notes.modelName, 'post');
  assert.equal(notes.ownerModelName, 'user');
  assert.deepEqual(notes.inverse(), author);
  assert.equal(messages.key, 'messages');
  assert.equal(messages.modelName, 'post');
  assert.equal(messages.ownerModelName, 'user');
  assert.deepEqual(messages.inverse(), messenger);
});
