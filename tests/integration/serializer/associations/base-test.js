import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('mirage:serializer:associations base test', {
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

test(`it can serialize a model with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts']
    })
  });

  let link = this.schema.author.find(1);
  var result = registry.serialize(link);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      posts: [
        {id: 1, title: 'Lorem'},
        {id: 2, title: 'Ipsum'}
      ]
    }
  });
});

test(`it can serialize a model with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    post: Serializer.extend({
      relationships: ['author']
    })
  });

  let post = this.schema.post.find(1);
  var result = registry.serialize(post);

  assert.deepEqual(result, {
    post: {
      id: 1,
      author_id: 1,
      title: 'Lorem',
      author: {id: 1, name: 'Link'}
    }
  });
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

test(`it can serialize a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    post: Serializer.extend({
      relationships: ['author']
    })
  });

  let post = this.schema.post.find(1);
  var result = registry.serialize(post);

  assert.deepEqual(result, {
    post: {
      id: 1,
      author_id: 1,
      title: 'Lorem',
      author: {id: 1, name: 'Link'}
    }
  });
});

test(`it supports a chain of serializers with relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts']
    }),
    post: Serializer.extend({
      relationships: ['comments']
    })
  });

  let author = this.schema.author.find(1);
  var result = registry.serialize(author);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      posts: [
        {id: 1, title: 'Lorem', comments: [
          {id: 1, text: 'pwned'}
        ]},
        {id: 2, title: 'Ipsum', comments: []}
      ]
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts']
    }),
    post: Serializer.extend({
      relationships: ['author']
    })
  });

  let author = this.schema.author.find(1);
  var result = registry.serialize(author);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      posts: [
        {id: 1, title: 'Lorem'},
        {id: 2, title: 'Ipsum'}
      ]
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources, two (and more) levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts']
    }),
    post: Serializer.extend({
      relationships: ['author', 'comments']
    }),
    comment: Serializer.extend({
      relationships: ['post']
    })
  });

  let author = this.schema.author.find(1);
  var result = registry.serialize(author);

  assert.deepEqual(result, {
    author :{
      id: 1,
      name: 'Link',
      posts: [
        {id: 1, title: 'Lorem', comments: [
          {id: 1, text: 'pwned'}
        ]},
        {id: 2, title: 'Ipsum', comments: []}
      ]
    }
  });
});
