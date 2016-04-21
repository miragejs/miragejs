import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Model', {
  beforeEach() {
    this.schema = schemaHelper.setup();

    let link = this.schema.wordSmiths.create({ firstName: 'Link' });
    let blogPost = link.createBlogPost({ title: 'Lorem' });
    blogPost.createFineComment({ text: 'pwned' });

    link.createBlogPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda' });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can include a has many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      include: ['blogPosts']
    })
  });

  let link = this.schema.wordSmiths.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    data: {
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
            data: {
              id: '1',
              type: 'word-smiths'
            }
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
            data: {
              id: '1',
              type: 'word-smiths'
            }
          }
        }
      }
    ]
  });
});

test(`it can include a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: JsonApiSerializer.extend({
      include: ['fineComments']
    })
  });

  let link = this.schema.wordSmiths.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    data: {
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
            data: {
              id: '1',
              type: 'word-smiths'
            }
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
            data: {
              id: '1',
              type: 'blog-posts'
            }
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
            data: {
              id: '1',
              type: 'word-smiths'
            }
          }
        }
      }
    ]
  });
});

test(`it can embed a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['wordSmith']
    })
  });

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
        'fine-comments': {
          data: [
            {
              id: '1',
              type: 'fine-comments'
            }
          ]
        },
        'word-smith': {
          data: {
            id: '1',
            type: 'word-smiths'
          }
        }
      }
    },
    'included': [
      {
        attributes: {
          'first-name': 'Link'
        },
        id: '1',
        type: 'word-smiths',
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

test(`it gracefully handles null belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['wordSmith']
    })
  });

  this.schema.blogPosts.create({ title: 'Lorem3' });
  let blogPost = this.schema.blogPosts.find(3);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    data: {
      type: 'blog-posts',
      id: '3',
      attributes: {
        title: 'Lorem3'
      },
      relationships: {
        'fine-comments': {
          data: []
        }
      }
    }
  });
});

test(`it can serialize a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['wordSmith']
    }),
    fineComment: JsonApiSerializer.extend({
      include: ['blogPost']
    })
  });

  let fineComment = this.schema.fineComments.find(1);
  let result = registry.serialize(fineComment);

  assert.deepEqual(result, {
    data: {
      type: 'fine-comments',
      id: '1',
      attributes: {
        text: 'pwned'
      },
      relationships: {
        'blog-post': {
          data: {
            id: '1',
            type: 'blog-posts'
          }
        }
      }
    },
    'included': [
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
            data: {
              type: 'word-smiths',
              id: '1'
            }
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

test(`it ignores relationships that refer to serialized ancestor resources`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: JsonApiSerializer.extend({
      include: ['wordSmith']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      attributes: {
        'first-name': 'Link'
      },
      id: '1',
      relationships: {
        'blog-posts': {
          data: [
            { type: 'blog-posts', id: '1' },
            { type: 'blog-posts', id: '2' }
          ]
        }
      },
      type: 'word-smiths'
    },
    included: [
      {
        attributes: {
          title: 'Lorem'
        },
        id: '1',
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
        },
        type: 'blog-posts'
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

test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: JsonApiSerializer.extend({
      include: ['wordSmith', 'fineComments']
    }),
    fineComment: JsonApiSerializer.extend({
      include: ['blogPost']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      attributes: {
        'first-name': 'Link'
      },
      id: '1',
      relationships: {
        'blog-posts': {
          data: [
            { type: 'blog-posts', id: '1' },
            { type: 'blog-posts', id: '2' }
          ]
        }
      },
      type: 'word-smiths'
    },
    included: [
      {
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
            data: [
              { type: 'fine-comments', id: '1' }
            ]
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
          'word-smith': {
            data: { type: 'word-smiths', id: '1' }
          },
          'fine-comments': {
            data: []
          }
        }
      }
    ]
  });
});
