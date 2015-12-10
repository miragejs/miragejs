import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Model', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.wordSmith.create({firstName: 'Link'});
    let blogPost = link.createBlogPost({title: 'Lorem'});
    blogPost.createFineComment({text: 'pwned'});

    link.createBlogPost({title: 'Ipsum'});

    this.schema.wordSmith.create({name: 'Zelda'});
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can include a has many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      relationships: ['blog-posts'],
    })
  });

  let link = this.schema.wordSmith.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: 1,
      attributes: {
        'first-name': 'Link',
      },
      relationships: {
        blogPosts: {
          data: [
            {type: 'blog-posts', id: 1},
            {type: 'blog-posts', id: 2},
          ]
        }
      }
    },
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

test(`it can include a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      relationships: ['blog-posts'],
    }),
    blogPost: JsonApiSerializer.extend({
      relationships: ['fine-comments'],
    })
  });

  let link = this.schema.wordSmith.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: 1,
      attributes: {
        'first-name': 'Link',
      },
      relationships: {
        blogPosts: {
          data: [
            {type: 'blog-posts', id: 1},
            {type: 'blog-posts', id: 2},
          ]
        }
      }
    },
    included: [
      {
        type: 'blog-posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          fineComments: {
            data: [
              {type: 'fine-comments', id: 1},
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
          fineComments: {
            data: []
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
      relationships: ['word-smith'],
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
        wordSmith: {
          data: {
            id: 1,
            type: "word-smiths"
          }
        }
      },
    },
    "included": [
      {
        attributes: {
          'first-name': "Link"
        },
        id: 1,
        type: "word-smiths"
      }
    ]
  });
});

test(`it gracefully handles null belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith']
    })
  });

  this.schema.blogPost.create({ id: 3, title: 'Lorem3' });
  let blogPost = this.schema.blogPost.find(3);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    data: {
      type: 'blog-posts',
      id: 3,
      attributes: {
        title: 'Lorem3'
      }
    }
  });
});

test(`it can serialize a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith'],
    }),
    fineComment: JsonApiSerializer.extend({
      relationships: ['blog-post'],
    })
  });

  let fineComment = this.schema.fineComment.find(1);
  let result = registry.serialize(fineComment);

  assert.deepEqual(result, {
    data: {
      type: 'fine-comments',
      id: 1,
      attributes: {
        text: 'pwned'
      },
      relationships: {
        blogPost: {
          data: {
            id: 1,
            type: "blog-posts"
          }
        }
      },
    },
    "included": [
      {
        type: 'blog-posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          wordSmith: {
            data: {
              type: 'word-smiths',
              id: 1
            }
          }
        }
      },
      {
        type: "word-smiths",
        id: 1,
        attributes: {
          'first-name': "Link"
        },
      }
    ]
  });
});

test(`it ignores relationships that refer to serialized ancestor resources`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      relationships: ['blog-posts'],
    }),
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith'],
    })
  });

  let wordSmith = this.schema.wordSmith.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      attributes: {
        'first-name': "Link"
      },
      id: 1,
      relationships: {
        blogPosts: {
          data: [
            {type: 'blog-posts', id: 1},
            {type: 'blog-posts', id: 2},
          ]
        }
      },
      type: "word-smiths"
    },
    included: [
      {
        attributes: {
          title: "Lorem"
        },
        id: 1,
        relationships: {
          wordSmith: {
            data: {type: 'word-smiths', id: 1}
          }
        },
        type: "blog-posts"
      },
      {
        type: "blog-posts",
        id: 2,
        attributes: {
          title: "Ipsum"
        },
        relationships: {
          wordSmith: {
            data: {type: 'word-smiths', id: 1}
          }
        },
      }
    ]
  });
});

test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      relationships: ['blog-posts'],
    }),
    blogPost: JsonApiSerializer.extend({
      relationships: ['word-smith', 'fine-comments'],
    }),
    fineComment: JsonApiSerializer.extend({
      relationships: ['blog-post']
    })
  });

  let wordSmith = this.schema.wordSmith.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      attributes: {
        'first-name': "Link"
      },
      id: 1,
      relationships: {
        blogPosts: {
          data: [
            {type: 'blog-posts', id: 1},
            {type: 'blog-posts', id: 2},
          ]
        }
      },
      type: "word-smiths"
    },
    included: [
      {
        type: "blog-posts",
        id: 1,
        attributes: {
          title: "Lorem"
        },
        relationships: {
          wordSmith: {
            data: {type: 'word-smiths', id: 1}
          },
          fineComments: {
            data: [
              {type: 'fine-comments', id: 1}
            ]
          }
        },
      },
      {
        type: "fine-comments",
        id: 1,
        attributes: {
          text: 'pwned'
        },
        relationships: {
          blogPost: {
            data: {type: 'blog-posts', id: 1}
          }
        },
      },
      {
        type: "blog-posts",
        id: 2,
        attributes: {
          title: "Ipsum"
        },
        relationships: {
          wordSmith: {
            data: {type: 'word-smiths', id: 1}
          },
          fineComments: {
            data: []
          }
        },
      }
    ]
  });
});
