import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Mixed');

test('unnamed one-to-many associations are correct', function(assert) {
  let schema = new Schema(new Db({
    wordSmiths: [
      { id: 1, name: 'Frodo' }
    ],
    blogPosts: [
      { id: 1, title: 'Lorem' }
    ]
  }), {
    wordSmith: Model.extend({
      blogPosts: hasMany()
    }),
    blogPost: Model.extend({
      wordSmith: belongsTo()
    })
  });

  let frodo = schema.wordSmiths.find(1);
  let association = frodo.associationFor('blogPosts');

  assert.equal(association.key, 'blogPosts');
  assert.equal(association.modelName, 'blog-post');
  assert.equal(association.ownerModelName, 'word-smith');

  let post = schema.blogPosts.find(1);

  assert.deepEqual(post.inverseFor(association), post.associationFor('wordSmith'));
});

test('a named one-to-many association is correct', function(assert) {
  let schema = new Schema(new Db({
    wordSmiths: [
      { id: 1, name: 'Frodo' }
    ],
    blogPosts: [
      { id: 1, title: 'Lorem' }
    ]
  }), {
    wordSmith: Model.extend({
      posts: hasMany('blog-post')
    }),
    blogPost: Model.extend({
      author: belongsTo('word-smith')
    })
  });

  let frodo = schema.wordSmiths.find(1);
  let association = frodo.associationFor('posts');

  assert.equal(association.key, 'posts');
  assert.equal(association.modelName, 'blog-post');
  assert.equal(association.ownerModelName, 'word-smith');

  let post = schema.blogPosts.find(1);

  assert.deepEqual(post.inverseFor(association), post.associationFor('author'));
});

test('multiple has-many associations of the same type', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ],
    posts: [
      { id: 1, title: 'Lorem' }
    ]
  }), {
    user: Model.extend({
      notes: hasMany('post', { inverse: 'author' }),
      messages: hasMany('post', { inverse: 'messenger' })
    }),
    post: Model.extend({
      author: belongsTo('user', { inverse: 'notes' }),
      messenger: belongsTo('user', { inverse: 'messages' })
    })
  });

  let frodo = schema.users.find(1);
  let notesAssociation = frodo.associationFor('notes');

  assert.equal(notesAssociation.key, 'notes');
  assert.equal(notesAssociation.modelName, 'post');
  assert.equal(notesAssociation.ownerModelName, 'user');

  let post = schema.posts.find(1);

  assert.deepEqual(post.inverseFor(notesAssociation), post.associationFor('author'));

  let messagesAssociation = frodo.associationFor('messages');

  assert.equal(messagesAssociation.key, 'messages');
  assert.equal(messagesAssociation.modelName, 'post');
  assert.equal(messagesAssociation.ownerModelName, 'user');

  assert.deepEqual(post.inverseFor(messagesAssociation), post.associationFor('messenger'));
});

test('one-to-many reflexive association is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ]
  }), {
    user: Model.extend({
      parent: belongsTo('user', { inverse: 'children' }),
      children: hasMany('user', { inverse: 'parent' })
    })
  });

  let frodo = schema.users.find(1);
  let parentAssociation = frodo.associationFor('parent');

  assert.equal(parentAssociation.key, 'parent');
  assert.equal(parentAssociation.modelName, 'user');
  assert.equal(parentAssociation.ownerModelName, 'user');

  assert.deepEqual(frodo.inverseFor(parentAssociation), frodo.associationFor('children'));
});
