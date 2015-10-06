import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Model', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.author.create({firstName: 'Link'});
    let post = link.createPost({title: 'Lorem'});
    post.createComment({text: 'pwned'});

    link.createPost({title: 'Ipsum'});

    this.schema.author.create({name: 'Zelda'});
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can include a has many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    author: JsonApiSerializer.extend({
      relationships: ['posts'],
    })
  });

  let link = this.schema.author.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    data: {
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

test(`it can include a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    author: JsonApiSerializer.extend({
      relationships: ['posts'],
    }),
    post: JsonApiSerializer.extend({
      relationships: ['comments'],
    })
  });

  let link = this.schema.author.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    data: {
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
              {type: 'comments', id: 1},
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

test(`it can embed a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    post: JsonApiSerializer.extend({
      relationships: ['author'],
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
          data: {
            id: 1,
            type: "authors"
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
        type: "authors"
      }
    ]
  });
});

test(`it can serialize a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    post: JsonApiSerializer.extend({
      relationships: ['author'],
    }),
    comment: JsonApiSerializer.extend({
      relationships: ['post'],
    })
  });

  let comment = this.schema.comment.find(1);
  let result = registry.serialize(comment);

  assert.deepEqual(result, {
    data: {
      type: 'comments',
      id: 1,
      attributes: {
        text: 'pwned'
      },
      relationships: {
        post: {
          data: {
            id: 1,
            type: "posts"
          }
        }
      },
    },
    "included": [
      {
        type: 'posts',
        id: 1,
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          author: {
            data: {
              type: 'authors',
              id: 1
            }
          }
        }
      },
      {
        type: "authors",
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
    author: JsonApiSerializer.extend({
      relationships: ['posts'],
    }),
    post: JsonApiSerializer.extend({
      relationships: ['author'],
    })
  });

  let author = this.schema.author.find(1);
  var result = registry.serialize(author);

  assert.deepEqual(result, {
    data: {
      attributes: {
        'first-name': "Link"
      },
      id: 1,
      relationships: {
        posts: {
          data: [
            {type: 'posts', id: 1},
            {type: 'posts', id: 2},
          ]
        }
      },
      type: "authors"
    },
    included: [
      {
        attributes: {
          title: "Lorem"
        },
        id: 1,
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          }
        },
        type: "posts"
      },
      {
        type: "posts",
        id: 2,
        attributes: {
          title: "Ipsum"
        },
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          }
        },
      }
    ]
  });
});

test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    author: JsonApiSerializer.extend({
      relationships: ['posts'],
    }),
    post: JsonApiSerializer.extend({
      relationships: ['author', 'comments'],
    }),
    comment: JsonApiSerializer.extend({
      relationships: ['post']
    })
  });

  let author = this.schema.author.find(1);
  var result = registry.serialize(author);

  assert.deepEqual(result, {
    data: {
      attributes: {
        'first-name': "Link"
      },
      id: 1,
      relationships: {
        posts: {
          data: [
            {type: 'posts', id: 1},
            {type: 'posts', id: 2},
          ]
        }
      },
      type: "authors"
    },
    included: [
      {
        type: "posts",
        id: 1,
        attributes: {
          title: "Lorem"
        },
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          },
          comments: {
            data: [
              {type: 'comments', id: 1}
            ]
          }
        },
      },
      {
        type: "comments",
        id: 1,
        attributes: {
          text: 'pwned'
        },
        relationships: {
          post: {
            data: {type: 'posts', id: 1}
          }
        },
      },
      {
        type: "posts",
        id: 2,
        attributes: {
          title: "Ipsum"
        },
        relationships: {
          author: {
            data: {type: 'authors', id: 1}
          },
          comments: {
            data: []
          }
        },
      }
    ]
  });
});
