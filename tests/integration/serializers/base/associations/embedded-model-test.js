import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Embedded Models', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let author = this.schema.author.create({name: 'Link'});
    let post = author.createPost({title: 'Lorem'});
    post.createComment({text: 'pwned'});

    author.createPost({title: 'Ipsum'});

    this.schema.author.create({name: 'Zelda'});

    this.BaseSerializer = Serializer.extend({
      embed: true
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can embed has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
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

test(`it can embed a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      relationships: ['posts']
    }),
    post: this.BaseSerializer.extend({
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

test(`it can embed a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    post: this.BaseSerializer.extend({
      embed: true,
      relationships: ['author']
    })
  });

  let post = this.schema.post.find(1);
  var result = registry.serialize(post);

  assert.deepEqual(result, {
    post: {
      id: 1,
      title: 'Lorem',
      author: {id: 1, name: 'Link'}
    }
  });
});

test(`it can serialize a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    comment: this.BaseSerializer.extend({
      relationships: ['post']
    }),
    post: this.BaseSerializer.extend({
      relationships: ['author']
    })
  });

  let comment = this.schema.comment.find(1);
  var result = registry.serialize(comment);

  assert.deepEqual(result, {
    comment: {
      id: 1,
      text: 'pwned',
      post: {
        id: 1,
        title: 'Lorem',
        author: {
          id: 1, name: 'Link'
        }
      },
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      relationships: ['posts']
    }),
    post: this.BaseSerializer.extend({
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

test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    author: this.BaseSerializer.extend({
      embed: true,
      relationships: ['posts']
    }),
    post: this.BaseSerializer.extend({
      relationships: ['author', 'comments']
    }),
    comment: this.BaseSerializer.extend({
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
