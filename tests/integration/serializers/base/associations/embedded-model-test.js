import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Embedded Models', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        posts: hasMany('blogPost', { inverse: 'author' })
      }),
      blogPost: Model.extend({
        author: belongsTo('wordSmith', { inverse: 'posts' }),
        comments: hasMany('fineComment', { inverse: 'post' })
      }),
      fineComment: Model.extend({
        post: belongsTo('blogPost')
      })
    });

    let wordSmith = this.schema.wordSmiths.create({ name: 'Link' });
    let post = wordSmith.createPost({ title: 'Lorem' });
    post.createComment({ text: 'pwned' });

    wordSmith.createPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda' });

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
    wordSmith: this.BaseSerializer.extend({
      include: ['posts']
    })
  });

  let link = this.schema.wordSmiths.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      posts: [
        { id: '1', title: 'Lorem' },
        { id: '2', title: 'Ipsum' }
      ]
    }
  });
});

test(`it can embed a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['posts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['comments']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      posts: [
        { id: '1', title: 'Lorem', comments: [
          { id: '1', text: 'pwned' }
        ] },
        { id: '2', title: 'Ipsum', comments: [] }
      ]
    }
  });
});

test(`it can embed a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    blogPost: this.BaseSerializer.extend({
      embed: true,
      include: ['author']
    })
  });

  let blogPost = this.schema.blogPosts.find(1);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    blogPost: {
      id: '1',
      title: 'Lorem',
      author: { id: '1', name: 'Link' }
    }
  });
});

test(`it can serialize a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    fineComment: this.BaseSerializer.extend({
      include: ['post']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['author']
    })
  });

  let fineComment = this.schema.fineComments.find(1);
  let result = registry.serialize(fineComment);

  assert.deepEqual(result, {
    fineComment: {
      id: '1',
      text: 'pwned',
      post: {
        id: '1',
        title: 'Lorem',
        author: {
          id: '1', name: 'Link'
        }
      }
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['posts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['author']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      posts: [
        { id: '1', title: 'Lorem' },
        { id: '2', title: 'Ipsum' }
      ]
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      embed: true,
      include: ['posts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['author', 'comments']
    }),
    fineComment: this.BaseSerializer.extend({
      include: ['post']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      posts: [
        { id: '1', title: 'Lorem', comments: [
          { id: '1', text: 'pwned' }
        ] },
        { id: '2', title: 'Ipsum', comments: [] }
      ]
    }
  });
});
