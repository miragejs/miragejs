import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Collection', {
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
  }
});

test(`it includes all relationships for a collection, regardless of being included`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });
  this.schema.wordSmiths.create({ firstName: 'Link', age: 123 });
  this.schema.wordSmiths.create({ firstName: 'Zelda', age: 456 });

  let collection = this.schema.wordSmiths.all();
  let result = registry.serialize(collection);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link',
        age: 123
      },
      relationships: {
        'posts': {
          data: []
        }
      }
    }, {
      type: 'word-smiths',
      id: '2',
      attributes: {
        'first-name': 'Zelda',
        age: 456
      },
      relationships: {
        'posts': {
          data: []
        }
      }
    }]
  });
});

test(`it can serialize a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    wordSmith: JSONAPISerializer.extend({
      include: ['posts']
    })
  });
  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  link.createPost({ title: 'Lorem' });
  link.createPost({ title: 'Ipsum' });
  this.schema.wordSmiths.create({ firstName: 'Zelda' });

  let collection = this.schema.wordSmiths.all();
  let result = registry.serialize(collection);

  assert.deepEqual(result, {
    data: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      },
      {
        type: 'word-smiths',
        id: '2',
        attributes: {
          'first-name': 'Zelda'
        },
        relationships: {
          'posts': {
            data: []
          }
        }
      }
    ],
    included: [
      {
        type: 'blog-posts',
        id: '1',
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'comments': {
            data: []
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      },
      {
        type: 'blog-posts',
        id: '2',
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          'comments': {
            data: []
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      }
    ]
  });
});

test(`it can serialize a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    wordSmith: JSONAPISerializer.extend({
      include: ['posts']
    }),
    blogPost: JSONAPISerializer.extend({
      include: ['comments']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let lorem = link.createPost({ title: 'Lorem' });
  lorem.createComment({ text: 'pwned' });
  link.createPost({ title: 'Ipsum' });
  this.schema.wordSmiths.create({ firstName: 'Zelda' });

  let collection = this.schema.wordSmiths.all();
  let result = registry.serialize(collection);

  assert.deepEqual(result, {
    data: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      },
      {
        type: 'word-smiths',
        id: '2',
        attributes: {
          'first-name': 'Zelda'
        },
        relationships: {
          'posts': {
            data: []
          }
        }
      }
    ],
    included: [
      {
        type: 'blog-posts',
        id: '1',
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'comments': {
            data: [
              { type: 'fine-comments', id: '1' }
            ]
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      },
      {
        type: 'fine-comments',
        id: '1',
        attributes: {
          text: 'pwned'
        },
        relationships: {
          'post': {
            data: { type: 'blog-posts', id: '1' }
          }
        }
      },
      {
        type: 'blog-posts',
        id: '2',
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          'comments': {
            data: []
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      }
    ]
  });
});

test(`it can serialize a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    blogPost: JSONAPISerializer.extend({
      include: ['author']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let post = link.createPost({ title: 'Lorem' });
  post.createComment();
  link.createPost({ title: 'Ipsum' });
  this.schema.wordSmiths.create({ firstName: 'Zelda' });

  let blogPosts = this.schema.blogPosts.all();
  let result = registry.serialize(blogPosts);

  assert.deepEqual(result, {
    data: [
      {
        type: 'blog-posts',
        id: '1',
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'comments': {
            data: [
              { type: 'fine-comments', id: '1' }
            ]
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      },
      {
        type: 'blog-posts',
        id: '2',
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          'comments': {
            data: []
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      }
    ],
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      }
    ]
  });
});

test(`it can serialize a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    fineComment: JSONAPISerializer.extend({
      include: ['post']
    }),
    blogPost: JSONAPISerializer.extend({
      include: ['author']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let post = link.createPost({ title: 'Lorem' });
  post.createComment({ text: 'pwned' });
  link.createPost({ title: 'Ipsum' });
  this.schema.wordSmiths.create({ firstName: 'Zelda' });

  let fineComments = this.schema.fineComments.all();
  let result = registry.serialize(fineComments);

  assert.deepEqual(result, {
    data: [
      {
        type: 'fine-comments',
        id: '1',
        attributes: {
          text: 'pwned'
        },
        relationships: {
          'post': {
            data: { type: 'blog-posts', id: '1' }
          }
        }
      }
    ],
    included: [
      {
        type: 'blog-posts',
        id: '1',
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'comments': {
            data: [
              {
                id: '1',
                type: 'fine-comments'
              }
            ]
          },
          'author': {
            data: { type: 'word-smiths', id: '1' }
          }
        }
      },
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'posts': {
            data: [
              {
                id: '1',
                type: 'blog-posts'
              },
              {
                id: '2',
                type: 'blog-posts'
              }
            ]
          }
        }
      }
    ]
  });
});

test(`it can serialize a collection of models that have both belongs-to and has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    blogPost: JSONAPISerializer.extend({
      include: ['author', 'comments']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let post = link.createPost({ title: 'Lorem' });
  post.createComment({ text: 'pwned' });
  link.createPost({ title: 'Ipsum' });
  this.schema.wordSmiths.create({ firstName: 'Zelda' });

  let blogPost = this.schema.blogPosts.find(1);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    data: {
      type: 'blog-posts',
      id: '1',
      attributes: {
        title: 'Lorem'
      },
      relationships: {
        'author': {
          data: { type: 'word-smiths', id: '1' }
        },
        'comments': {
          data: [{ type: 'fine-comments', id: '1' }]
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'posts': {
            data: [
              {
                id: '1',
                type: 'blog-posts'
              },
              {
                id: '2',
                type: 'blog-posts'
              }
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: '1',
        attributes: {
          'text': 'pwned'
        },
        relationships: {
          'post': {
            data: {
              id: '1',
              type: 'blog-posts'
            }
          }
        }
      }
    ]
  });

});
