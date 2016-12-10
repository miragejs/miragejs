import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Embedded Collections', {
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
    let blogPost = wordSmith.createPost({ title: 'Lorem' });
    blogPost.createComment({ text: 'pwned' });

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

test(`it can embed a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['posts']
    })
  });

  let wordSmiths = this.schema.wordSmiths.all();
  let result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {
        id: '1',
        name: 'Link',
        posts: [
          { id: '1', title: 'Lorem' },
          { id: '2', title: 'Ipsum' }
        ]
      },
      {
        id: '2',
        name: 'Zelda',
        posts: []
      }
    ]
  });
});

test(`it can embed a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['posts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['comments']
    })
  });

  let wordSmiths = this.schema.wordSmiths.all();
  let result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {
        id: '1',
        name: 'Link',
        posts: [
          {
            id: '1',
            title: 'Lorem',
            comments: [
              { id: '1', text: 'pwned' }
            ]
          },
          {
            id: '2',
            title: 'Ipsum',
            comments: []
          }
        ]
      },
      {
        id: '2',
        name: 'Zelda',
        posts: []
      }
    ]
  });
});

test(`it can embed a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    blogPost: this.BaseSerializer.extend({
      include: ['author']
    })
  });

  let blogPosts = this.schema.blogPosts.all();
  let result = registry.serialize(blogPosts);

  assert.deepEqual(result, {
    blogPosts: [
      {
        id: '1',
        title: 'Lorem',
        author: { id: '1', name: 'Link' }
      },
      {
        id: '2',
        title: 'Ipsum',
        author: { id: '1', name: 'Link' }
      }
    ]
  });
});

test(`it can embed a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    fineComment: this.BaseSerializer.extend({
      include: ['post']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['author']
    })
  });

  let fineComments = this.schema.fineComments.all();
  let result = registry.serialize(fineComments);

  assert.deepEqual(result, {
    fineComments: [
      {
        id: '1',
        text: 'pwned',
        post: {
          id: '1',
          title: 'Lorem',
          author: { id: '1', name: 'Link' }
        }
      }
    ]
  });
});
