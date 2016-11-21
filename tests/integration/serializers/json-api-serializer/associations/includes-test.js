import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { JSONAPISerializer, Model, hasMany, belongsTo } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Includes', {
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
        blogPost: belongsTo(),
        category: belongsTo()
      }),

      category: Model.extend({
        labels: hasMany()
      }),

      label: Model.extend({

      })
    });
  }
});

test('includes get serialized with correct serializer', function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    blogPost: JSONAPISerializer.extend({
      attrs: ['title'],
      include: ['wordSmith']
    }),
    wordSmith: JSONAPISerializer.extend({
      attrs: ['firstName']
    })
  });

  let post = this.schema.blogPosts.create({ title: 'We love Mirage!' });
  post.createWordSmith({ firstName: 'Sam' });

  let result = registry.serialize(post);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: '1',
      attributes: {
        'title': 'We love Mirage!'
      },
      relationships: {
        'fine-comments': {
          'data': []
        },
        'word-smith': {
          data: { type: 'word-smiths', id: '1' }
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Sam'
        },
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' }
            ]
          }
        }
      }
    ]
  });
});

test('query param includes work when serializing a model', function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });

  let post = this.schema.blogPosts.create();
  post.createWordSmith();
  post.createFineComment();
  post.createFineComment();

  let request = {
    queryParams: {
      include: 'word-smith,fine-comments'
    }
  };

  let result = registry.serialize(post, request);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: '1',
      attributes: {},
      relationships: {
        'word-smith': {
          data: { type: 'word-smiths', id: '1' }
        },
        'fine-comments': {
          data: [
            { type: 'fine-comments', id: '1' },
            { type: 'fine-comments', id: '2' }
          ]
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {},
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' }
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: '1',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          },
          category: { data: null }
        }
      },
      {
        type: 'fine-comments',
        id: '2',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          },
          category: { data: null }
        }
      }
    ]
  });
});

test('query param includes work when serializing a collection', function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });

  let post1 = this.schema.blogPosts.create();
  post1.createWordSmith();
  post1.createFineComment();
  post1.createFineComment();
  this.schema.blogPosts.create();

  let request = {
    queryParams: {
      include: 'word-smith,fine-comments'
    }
  };

  let result = registry.serialize(this.schema.blogPosts.all(), request);

  assert.propEqual(result, {
    data: [
      {
        type: 'blog-posts',
        id: '1',
        attributes: {},
        relationships: {
          'word-smith': {
            data: { type: 'word-smiths', id: '1' }
          },
          'fine-comments': {
            data: [
              { type: 'fine-comments', id: '1' },
              { type: 'fine-comments', id: '2' }
            ]
          }
        }
      },
      {
        type: 'blog-posts',
        id: '2',
        attributes: {},
        relationships: {
          'word-smith': {
            data: null
          },
          'fine-comments': {
            data: []
          }
        }
      }
    ],
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {},
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' }
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: '1',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          },
          category: { data: null }
        }
      },
      {
        type: 'fine-comments',
        id: '2',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          },
          category: { data: null }
        }
      }
    ]
  });
});

test('query param includes take precedence over default server includes', function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    blogPost: JSONAPISerializer.extend({
      include: ['wordSmith']
    })
  });

  let post = this.schema.blogPosts.create();
  post.createWordSmith();
  post.createFineComment();
  post.createFineComment();

  let request = {
    queryParams: {
      include: 'fine-comments'
    }
  };

  let result = registry.serialize(post, request);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: '1',
      attributes: {},
      relationships: {
        'word-smith': {
          data: { type: 'word-smiths', id: '1' }
        },
        'fine-comments': {
          data: [
            { type: 'fine-comments', id: '1' },
            { type: 'fine-comments', id: '2' }
          ]
        }
      }
    },
    included: [
      {
        type: 'fine-comments',
        id: '1',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          },
          category: { data: null }
        }
      },
      {
        type: 'fine-comments',
        id: '2',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          },
          category: { data: null }
        }
      }
    ]
  });
});

test('query param includes support dot-paths when serializing a model', function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });

  this.schema.db.loadData({
    wordSmiths: [
      { id: 1, name: 'Sam' }
    ],
    blogPosts: [
      { id: 2, wordSmithId: 1, title: 'Lorem Ipsum' }
    ],
    fineComments: [
      { id: 3, text: 'Foo', blogPostId: 2, categoryId: 10 }
    ],
    categories: [
      { id: 10, foo: 'bar' }
    ],
    labels: [
      { id: 20, name: 'Economics', categoryId: 10 }
    ]
  });
  let request = {
    queryParams: {
      include: 'wordSmith,fineComments.category.labels'
    }
  };
  let result = registry.serialize(this.schema.blogPosts.first(), request);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: '2',
      attributes: {
        title: 'Lorem Ipsum'
      },
      relationships: {
        'word-smith': {
          data: { type: 'word-smiths', id: '1' }
        },
        'fine-comments': {
          data: [
            { type: 'fine-comments', id: '3' }
          ]
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          name: 'Sam'
        },
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: '3',
        attributes: {
          text: 'Foo'
        },
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '2' }
          },
          'category': {
            data: { type: 'categories', id: '10' }
          }
        }
      },
      {
        type: 'categories',
        id: '10',
        attributes: {
          foo: 'bar'
        },
        relationships: {
          'labels': {
            data: [
              { type: 'labels', id: '20' }
            ]
          }
        }
      },
      {
        type: 'labels',
        id: '20',
        attributes: {
          name: 'Economics'
        }
      }
    ]
  });
});

test('query param includes support dot-paths when serializing a collection', function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });

  this.schema.db.loadData({
    wordSmiths: [
      { id: 1, name: 'Sam' }
    ],
    blogPosts: [
      { id: 2, wordSmithId: 1, title: 'Lorem Ipsum' },
      { id: 5, wordSmithId: 1, title: 'Dolor' }
    ],
    fineComments: [
      { id: 3, text: 'Foo', blogPostId: 2, categoryId: 10 }
    ],
    categories: [
      { id: 10, foo: 'bar' }
    ],
    labels: [
      { id: 20, name: 'Economics', categoryId: 10 }
    ]
  });
  let request = {
    queryParams: {
      include: 'wordSmith,fineComments.category.labels'
    }
  };
  let result = registry.serialize(this.schema.blogPosts.all(), request);

  assert.propEqual(result, {
    data: [
      {
        type: 'blog-posts',
        id: '2',
        attributes: {
          title: 'Lorem Ipsum'
        },
        relationships: {
          'word-smith': {
            data: { type: 'word-smiths', id: '1' }
          },
          'fine-comments': {
            data: [
              { type: 'fine-comments', id: '3' }
            ]
          }
        }
      },
      {
        type: 'blog-posts',
        id: '5',
        attributes: {
          title: 'Dolor'
        },
        relationships: {
          'word-smith': {
            data: { type: 'word-smiths', id: '1' }
          },
          'fine-comments': {
            data: [
            ]
          }
        }
      }
    ],
    included: [
      {
        type: 'word-smiths',
        id: '1',
        attributes: {
          name: 'Sam'
        },
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '2' },
              { type: 'blog-posts', id: '5' }
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: '3',
        attributes: {
          text: 'Foo'
        },
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '2' }
          },
          'category': {
            data: { type: 'categories', id: '10' }
          }
        }
      },
      {
        type: 'categories',
        id: '10',
        attributes: {
          foo: 'bar'
        },
        relationships: {
          'labels': {
            data: [
              { type: 'labels', id: '20' }
            ]
          }
        }
      },
      {
        type: 'labels',
        id: '20',
        attributes: {
          name: 'Economics'
        }
      }
    ]
  });
});
