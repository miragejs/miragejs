import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('mirage:serializer:associations embedded - collection', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let author = this.schema.author.create({name: 'Link'});
    let post = author.createPost({title: 'Lorem'});
    post.createComment({text: 'pwned'});

    author.createPost({title: 'Ipsum'});

    this.schema.author.create({name: 'Zelda'});
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can serialize a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts']
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {
        id: 1,
        name: 'Link',
        posts: [
          {id: 1, title: 'Lorem'},
          {id: 2, title: 'Ipsum'}
        ]
      },
      {
        id: 2,
        name: 'Zelda',
        posts: []
      }
    ]
  });
});

test(`it can serialize a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts']
    }),
    post: Serializer.extend({
      relationships: ['comments']
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {
        id: 1,
        name: 'Link',
        posts: [
          {
            id: 1,
            title: 'Lorem',
            comments: [
              {id: 1, text: 'pwned'}
            ]
          },
          {
            id: 2,
            title: 'Ipsum',
            comments: []
          }
        ]
      },
      {
        id: 2,
        name: 'Zelda',
        posts: []
      }
    ]
  });
});

test(`it can serialize a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    post: Serializer.extend({
      relationships: ['author']
    })
  });

  let posts = this.schema.post.all();
  var result = registry.serialize(posts);

  assert.deepEqual(result, {
    posts: [
      {
        id: 1,
        title: 'Lorem',
        author: {id: 1, name: 'Link'}
      },
      {
        id: 2,
        title: 'Ipsum',
        author: {id: 1, name: 'Link'}
      }
    ]
  });
});

test(`it can serialize a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    comment: Serializer.extend({
      relationships: ['post']
    }),
    post: Serializer.extend({
      relationships: ['author']
    })
  });

  let comments = this.schema.comment.all();
  var result = registry.serialize(comments);

  assert.deepEqual(result, {
    comments: [
      {
        id: 1,
        text: 'pwned',
        post: {
          id: 1,
          title: 'Lorem',
          author: {id: 1, name: 'Link'}
        }
      }
    ]
  });
});
