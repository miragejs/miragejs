import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('mirage:serializer:associations sideloading - collection', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.author.create({name: 'Link'});
    let post = link.createPost({title: 'Lorem'});
    link.createPost({title: 'Ipsum'});

    post.createComment({text: 'pwned'});


    let zelda = this.schema.author.create({name: 'Zelda'});
    zelda.createPost({title: `Zeldas post`});
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

  let authors = this.schema.author.all();

  assert.throws(function() {
    registry.serialize(authors);
  }, /disables the root/);
});

test(`it can sideload a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link', post_ids: [1, 2]},
      {id: 2, name: 'Zelda', post_ids: [3]},
    ],
    posts: [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1},
      {id: 3, title: 'Zeldas post', author_id: 2}
    ]
  });
});

test(`it can sideload a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    }),
    post: Serializer.extend({
      relationships: ['comments'],
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link', post_ids: [1, 2]},
      {id: 2, name: 'Zelda', post_ids: [3]}
    ],
    posts: [
      {id: 1, title: 'Lorem', author_id: 1, comment_ids: [1]},
      {id: 2, title: 'Ipsum', author_id: 1, comment_ids: []},
      {id: 3, title: 'Zeldas post', author_id: 2, comment_ids: []}
    ],
    comments: [
      {id: 1, text: 'pwned', post_id: 1}
    ]
  });
});

test(`it avoids circularity when serializing a collection`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    }),
    post: Serializer.extend({
      relationships: ['author'],
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link', post_ids: [1, 2] },
      {id: 2, name: 'Zelda', post_ids: [3] },
    ],
    posts: [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1},
      {id: 3, title: 'Zeldas post', author_id: 2},
    ]
  });
});

test(`it can sideload a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    post: Serializer.extend({
      embed: false,
      relationships: ['author'],
    })
  });

  let posts = this.schema.post.all();
  var result = registry.serialize(posts);

  assert.deepEqual(result, {
    posts: [
      {id: 1, title: 'Lorem', author_id: 1 },
      {id: 2, title: 'Ipsum', author_id: 1 },
      {id: 3, title: 'Zeldas post', author_id: 2 },
    ],
    authors: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });
});

test(`it can sideload a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    comment: Serializer.extend({
      embed: false,
      relationships: ['post'],
    }),
    post: Serializer.extend({
      relationships: ['author'],
    })
  });

  let comments = this.schema.comment.all();
  var result = registry.serialize(comments);

  assert.deepEqual(result, {
    comments: [
      {id: 1, text: 'pwned', post_id: 1}
    ],
    posts: [
      {id: 1, title: 'Lorem', author_id: 1}
    ],
    authors: [
      {id: 1, name: 'Link'}
    ]
  });
});
