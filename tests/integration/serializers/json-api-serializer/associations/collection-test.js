import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Collection', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.author.create({firstName: 'Link'});
    let post = link.createPost({title: 'Lorem'});
    post.createComment({text: 'pwned'});

    link.createPost({title: 'Ipsum'});

    this.schema.author.create({firstName: 'Zelda'});
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can serialize a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    author: JsonApiSerializer.extend({
      relationships: ['posts'],
    })
  });

  let authors = this.schema.author.all();
  let result = registry.serialize(authors);

  assert.deepEqual(result, {
    data: [
      {
        type: 'authors',
        id: 1,
        attributes: {
          'first-name': 'Link',
        },
        relationships: {
          posts: {
            data: [
              {type: 'posts', id: 1},
              {type: 'posts', id: 2},
            ]
          }
        }
      },
      {
        type: 'authors',
        id: 2,
        attributes: {
          'first-name': 'Zelda'
        },
        relationships: {
          posts: {
            data: []
          }
        }
      }
    ],
    included: [
      {
        type: 'posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        }
      },
      {
        type: 'posts',
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
    author: JsonApiSerializer.extend({
      relationships: ['posts']
    }),
    post: JsonApiSerializer.extend({
      relationships: ['comments']
    })
  });

  let authors = this.schema.author.all();
  var result = registry.serialize(authors);

  assert.deepEqual(result, {
    data: [
      {
        type: 'authors',
        id: 1,
        attributes: {
          'first-name': 'Link',
        },
        relationships: {
          posts: {
            data: [
              {type: 'posts', id: 1},
              {type: 'posts', id: 2},
            ]
          }
        }
      },
      {
        type: 'authors',
        id: 2,
        attributes: {
          'first-name': 'Zelda'
        },
        relationships: {
          posts: {
            data: []
          }
        }
      }
    ],
    included: [
      {
        type: 'posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          comments: {
            data: [
              {type: 'comments', id: 1}
            ]
          }
        }
      },
      {
        type: 'comments',
        id: 1,
        attributes: {
          text: 'pwned'
        }
      },
      {
        type: 'posts',
        id: 2,
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          comments: {
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
    post: JsonApiSerializer.extend({
      relationships: ['author']
    })
  });

  let posts = this.schema.post.all();
  let result = registry.serialize(posts);

  assert.deepEqual(result, {
    data: [
      {
        type: 'posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          }
        }
      },
      {
        type: 'posts',
        id: 2,
        attributes: {
          title: 'Ipsum'
        },
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          }
        }
      }
    ],
    included: [
      {
        type: 'authors',
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
    comment: JsonApiSerializer.extend({
      relationships: ['post']
    }),
    post: JsonApiSerializer.extend({
      relationships: ['author']
    })
  });

  let comments = this.schema.comment.all();
  let result = registry.serialize(comments);

  assert.deepEqual(result, {
    data: [
      {
        type: 'comments',
        id: 1,
        attributes: {
          text: 'pwned'
        },
        relationships: {
          post: {
            data: {type: 'posts', id: 1}
          }
        }
      }
    ],
    included: [
      {
        type: 'posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          }
        }
      },
      {
        type: 'authors',
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
    post: JsonApiSerializer.extend({
      relationships: ['author', 'comments']
    })
  });

  let post = this.schema.post.find(1);
  let result = registry.serialize(post);

  assert.deepEqual(result, {
    data: {
      type: 'posts',
      id: 1,
      attributes: {
        title: 'Lorem'
      },
      relationships: {
        author: {
          data: {type: 'authors', id: 1}
        },
        comments: {
          data: [{type: 'comments', id: 1}]
        }
      }
    },
    included: [
      {
        type: 'authors',
        id: 1,
        attributes: {
          'first-name': 'Link'
        }
      },
      {
        type: 'comments',
        id: 1,
        attributes: {
          'text': 'pwned'
        }
      }
    ]
  });

});
