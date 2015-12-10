import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Collection', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.wordSmith.create({firstName: 'Link'});
    let blogPost = link.createBlogPost({title: 'Lorem'});
    blogPost.createFineComment({text: 'pwned'});

    link.createBlogPost({title: 'Ipsum'});

    this.schema.wordSmith.create({firstName: 'Zelda'});
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can serialize a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      relationships: ['blog-posts'],
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  let result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    data: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {
          'first-name': 'Link',
        },
        relationships: {
          'blog-posts': {
            data: [
              {type: 'blog-posts', id: 1},
              {type: 'blog-posts', id: 2},
            ]
          }
        }
      },
      {
        type: 'word-smiths',
        id: 2,
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
        id: 1,
        attributes: {
          title: 'Lorem'
        }
      },
      {
        type: 'blog-posts',
        id: 2,
        attributes: {
          title: 'Ipsum'
        }
      }
    ]
  });
});

test(`it can serialize a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      relationships: ['blog-posts']
    }),
    blogPost: JsonApiSerializer.extend({
      relationships: ['fine-comments']
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  let result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    data: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {
          'first-name': 'Link',
        },
        relationships: {
          'blog-posts': {
            data: [
              {type: 'blog-posts', id: 1},
              {type: 'blog-posts', id: 2},
            ]
          }
        }
      },
      {
        type: 'word-smiths',
        id: 2,
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
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'fine-comments': {
            data: [
              {type: 'fine-comments', id: 1}
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: 1,
        attributes: {
          text: 'pwned'
        }
      },
      {
        type: 'blog-posts',
        id: 2,
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          'fine-comments': {
            data: []
          }
        }
      }
    ]
  });
});

test(`it can serialize a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith']
    })
  });

  let blogPosts = this.schema.blogPost.all();
  let result = registry.serialize(blogPosts);

  assert.deepEqual(result, {
    data: [
      {
        type: 'blog-posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'word-smith': {
            data: {type: 'word-smiths', id: 1}
          }
        }
      },
      {
        type: 'blog-posts',
        id: 2,
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          'word-smith': {
            data: {type: 'word-smiths', id: 1}
          }
        }
      }
    ],
    included: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {
          'first-name': 'Link',
        }
      }
    ]
  });
});

test(`it can serialize a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    fineComment: JsonApiSerializer.extend({
      relationships: ['blog-post']
    }),
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith']
    })
  });

  let fineComments = this.schema.fineComment.all();
  let result = registry.serialize(fineComments);

  assert.deepEqual(result, {
    data: [
      {
        type: 'fine-comments',
        id: 1,
        attributes: {
          text: 'pwned'
        },
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      }
    ],
    included: [
      {
        type: 'blog-posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'word-smith': {
            data: {type: 'word-smiths', id: 1}
          }
        }
      },
      {
        type: 'word-smiths',
        id: 1,
        attributes: {
          'first-name': 'Link'
        }
      }
    ]
  });
});

test(`it can serialize a collection of models that have both belongs-to and has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith', 'fine-comments']
    })
  });

  let blogPost = this.schema.blogPost.find(1);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    data: {
      type: 'blog-posts',
      id: 1,
      attributes: {
        title: 'Lorem'
      },
      relationships: {
        'word-smith': {
          data: {type: 'word-smiths', id: 1}
        },
        'fine-comments': {
          data: [{type: 'fine-comments', id: 1}]
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {
          'first-name': 'Link'
        }
      },
      {
        type: 'fine-comments',
        id: 1,
        attributes: {
          'text': 'pwned'
        }
      }
    ]
  });

});
