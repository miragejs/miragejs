import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Sideloading Collections', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.author.create({name: 'Link'});
    let post = link.createPost({title: 'Lorem'});
    link.createPost({title: 'Ipsum'});

    post.createComment({text: 'pwned'});

    let zelda = this.schema.author.create({name: 'Zelda'});
    zelda.createPost({title: `Zeldas post`});

    this.BaseSerializer = Serializer.extend({
      embed: false
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it throws an error if embed is false and root is false`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: this.BaseSerializer.extend({
      root: false,
      relationships: ['posts'],
    })
  });

  let authors = this.schema.author.all();

  assert.throws(function() {
    registry.serialize(authors);
  }, /disables the root/);
});

test(`it can sideload an empty collection`, function(assert) {
  this.schema.db.emptyData();
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      relationships: ['posts'],
    })
  });

  var result = registry.serialize(this.schema.author.all());

  assert.deepEqual(result, {
    authors: []
  });
});

test(`it can sideload a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      embed: false,
      relationships: ['posts'],
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link', postIds: [1, 2]},
      {id: 2, name: 'Zelda', postIds: [3]},
    ],
    posts: [
      {id: 1, title: 'Lorem', authorId: 1},
      {id: 2, title: 'Ipsum', authorId: 1},
      {id: 3, title: 'Zeldas post', authorId: 2}
    ]
  });
});

test(`it can sideload a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      embed: false,
      relationships: ['posts'],
    }),
    post: this.BaseSerializer.extend({
      relationships: ['comments'],
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link', postIds: [1, 2]},
      {id: 2, name: 'Zelda', postIds: [3]}
    ],
    posts: [
      {id: 1, title: 'Lorem', authorId: 1, commentIds: [1]},
      {id: 2, title: 'Ipsum', authorId: 1, commentIds: []},
      {id: 3, title: 'Zeldas post', authorId: 2, commentIds: []}
    ],
    comments: [
      {id: 1, text: 'pwned', postId: 1}
    ]
  });
});

test(`it avoids circularity when serializing a collection`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      embed: false,
      relationships: ['posts'],
    }),
    post: this.BaseSerializer.extend({
      relationships: ['author'],
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link', postIds: [1, 2] },
      {id: 2, name: 'Zelda', postIds: [3] },
    ],
    posts: [
      {id: 1, title: 'Lorem', authorId: 1},
      {id: 2, title: 'Ipsum', authorId: 1},
      {id: 3, title: 'Zeldas post', authorId: 2},
    ]
  });
});

test(`it can sideload a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    post: this.BaseSerializer.extend({
      embed: false,
      relationships: ['author'],
    })
  });

  let posts = this.schema.post.all();
  var result = registry.serialize(posts);

  assert.deepEqual(result, {
    posts: [
      {id: 1, title: 'Lorem', authorId: 1 },
      {id: 2, title: 'Ipsum', authorId: 1 },
      {id: 3, title: 'Zeldas post', authorId: 2 },
    ],
    authors: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });
});

test(`it can sideload a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    comment: this.BaseSerializer.extend({
      embed: false,
      relationships: ['post'],
    }),
    post: this.BaseSerializer.extend({
      relationships: ['author'],
    })
  });

  let comments = this.schema.comment.all();
  var result = registry.serialize(comments);

  assert.deepEqual(result, {
    comments: [
      {id: 1, text: 'pwned', postId: 1}
    ],
    posts: [
      {id: 1, title: 'Lorem', authorId: 1}
    ],
    authors: [
      {id: 1, name: 'Link'}
    ]
  });
});
