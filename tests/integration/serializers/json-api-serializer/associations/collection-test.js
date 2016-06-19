import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Collection', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo(),
        fineComments: hasMany()
      }),
      fineComment: Model.extend({
        blogPost: belongsTo()
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
        'blog-posts': {
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
        'blog-posts': {
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
      include: ['blogPosts']
    })
  });
  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  link.createBlogPost({ title: 'Lorem' });
  link.createBlogPost({ title: 'Ipsum' });
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
          'blog-posts': {
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
          'blog-posts': {
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
          'fine-comments': {
            data: []
          },
          'word-smith': {
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
          'fine-comments': {
            data: []
          },
          'word-smith': {
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
      include: ['blogPosts']
    }),
    blogPost: JSONAPISerializer.extend({
      include: ['fineComments']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let lorem = link.createBlogPost({ title: 'Lorem' });
  lorem.createFineComment({ text: 'pwned' });
  link.createBlogPost({ title: 'Ipsum' });
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
          'blog-posts': {
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
          'blog-posts': {
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
          'fine-comments': {
            data: [
              { type: 'fine-comments', id: '1' }
            ]
          },
          'word-smith': {
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
          'blog-post': {
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
          'fine-comments': {
            data: []
          },
          'word-smith': {
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
      include: ['wordSmith']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let post = link.createBlogPost({ title: 'Lorem' });
  post.createFineComment();
  link.createBlogPost({ title: 'Ipsum' });
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
          'fine-comments': {
            data: [
              { type: 'fine-comments', id: '1' }
            ]
          },
          'word-smith': {
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
          'fine-comments': {
            data: []
          },
          'word-smith': {
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
          'blog-posts': {
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
      include: ['blogPost']
    }),
    blogPost: JSONAPISerializer.extend({
      include: ['wordSmith']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let post = link.createBlogPost({ title: 'Lorem' });
  post.createFineComment({ text: 'pwned' });
  link.createBlogPost({ title: 'Ipsum' });
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
          'blog-post': {
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
          'fine-comments': {
            data: [
              {
                id: '1',
                type: 'fine-comments'
              }
            ]
          },
          'word-smith': {
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
          'blog-posts': {
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
      include: ['wordSmith', 'fineComments']
    })
  });

  let link = this.schema.wordSmiths.create({ firstName: 'Link' });
  let post = link.createBlogPost({ title: 'Lorem' });
  post.createFineComment({ text: 'pwned' });
  link.createBlogPost({ title: 'Ipsum' });
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
        'word-smith': {
          data: { type: 'word-smiths', id: '1' }
        },
        'fine-comments': {
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
          'blog-posts': {
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
          'blog-post': {
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
