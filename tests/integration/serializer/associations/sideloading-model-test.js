import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('mirage:serializer:associations sideloading - model', {
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

test(`it throws an error if embed is false and root is false`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      root: false,
      relationships: ['posts'],
    })
  });

  let link = this.schema.author.find(1);
  assert.throws(function() {
    registry.serialize(link);
  }, /disables the root/);

});

test(`it can sideload a model with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    })
  });

  let link = this.schema.author.find(1);
  var result = registry.serialize(link);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      post_ids: [1, 2]
    },
    posts: [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1}
    ]
  });
});

test(`it can sideload a model with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    }),
    post: Serializer.extend({
      relationships: ['comments'],
    })
  });

  let link = this.schema.author.find(1);
  var result = registry.serialize(link);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      post_ids: [1, 2]
    },
    posts: [
      {id: 1, title: 'Lorem', author_id: 1, comment_ids: [1]},
      {id: 2, title: 'Ipsum', author_id: 1, comment_ids: []}
    ],
    comments: [
      {id: 1, text: 'pwned', post_id: 1}
    ]
  });
});

test(`it avoids circularity when serializing a model`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    }),
    post: Serializer.extend({
      relationships: ['author'],
    })
  });

  let link = this.schema.author.find(1);
  var result = registry.serialize(link);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      post_ids: [1, 2]
    },
    posts: [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1}
    ]
  });
});

test(`it can sideload a model with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    post: Serializer.extend({
      embed: false,
      relationships: ['author'],
    })
  });

  let post = this.schema.post.find(1);
  var result = registry.serialize(post);

  assert.deepEqual(result, {
    post: {
      id: 1, title: 'Lorem', author_id: 1
    },
    authors: [
      {id: 1, name: 'Link'}
    ]
  });
});

test(`it can sideload a model with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    comment: Serializer.extend({
      embed: false,
      relationships: ['post'],
    }),
    post: Serializer.extend({
      relationships: ['author'],
    })
  });

  let comment = this.schema.comment.find(1);
  var result = registry.serialize(comment);

  assert.deepEqual(result, {
    comment: {
      id: 1, text: 'pwned', post_id: 1
    },
    posts: [
      {id: 1, title: 'Lorem', author_id: 1}
    ],
    authors: [
      {id: 1, name: 'Link'}
    ]
  });
});
