// jscs:disable disallowConstOutsideModuleScope
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Included', {
  beforeEach() {
    this.schema = schemaHelper.setup();

    const smith = this.schema.wordSmiths.create();
    const post = smith.createBlogPost();
    post.createFineComment();
    post.createFineComment();
    this.schema.blogPosts.create();

    const foo = this.schema.foos.create();
    const bar = foo.createBar();
    foo.save();
    const baz = bar.createBaz();
    bar.save();
    const quux1 = baz.createQuux();
    const quux2 = baz.createQuux();
    baz.save();
    const zomg1 = quux1.createZomg();
    const zomg2 = quux1.createZomg();
    quux1.save();
    const zomg3 = quux2.createZomg();
    const zomg4 = quux2.createZomg();
    quux2.save();
    zomg1.createLol();
    zomg2.createLol();
    zomg3.createLol();
    zomg4.createLol();
    zomg1.save();
    zomg2.save();
    zomg3.save();
    zomg4.save();
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`model: it can include relationships specified by the include query param`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer
  });

  const post = this.schema.blogPosts.find(1);
  const request = {
    queryParams: {
      include: 'word-smith,fine-comments'
    }
  };
  const result = registry.serialize(post, request);

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
          }
        }
      },
      {
        type: 'fine-comments',
        id: '2',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          }
        }
      }
    ]
  });
});

test(`model: it can include relationships specified by a combination of the include query param (hasMany) and serializer.relationships (belongsTo, ignored)`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['wordSmith']
    })
  });

  const post = this.schema.blogPosts.find(1);
  const request = {
    queryParams: {
      include: 'fine-comments'
    }
  };
  const result = registry.serialize(post, request);

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
          }
        }
      },
      {
        type: 'fine-comments',
        id: '2',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          }
        }
      }
    ]
  });
});

test(`model: it can include relationships specified by a combination of the include query param (belongsTo) and serializer.relationships (hasMany, ignored)`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['fineComments']
    })
  });

  const post = this.schema.blogPosts.find(1);
  const request = {
    queryParams: {
      include: 'word-smith'
    }
  };
  const result = registry.serialize(post, request);

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
      }
    ]
  });
});

test(`collection: it can include relationships specified by the include query param`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer
  });

  const post = this.schema.blogPosts.find([1, 2]);
  const request = {
    queryParams: {
      include: 'word-smith,fine-comments'
    }
  };
  const result = registry.serialize(post, request);

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
          }
        }
      },
      {
        type: 'fine-comments',
        id: '2',
        attributes: {},
        relationships: {
          'blog-post': {
            data: { type: 'blog-posts', id: '1' }
          }
        }
      }
    ]
  });
});

test(`dot-paths in include query params include query param`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer
  });

  const foo = this.schema.foos.find(1);
  const request = {
    queryParams: {
      include: 'bar.baz.quuxes.zomgs.lol'
    }
  };
  const result = registry.serialize(foo, request);

  assert.propEqual(result, {
    data: {
      type: 'foos',
      id: '1',
      attributes: {},
      relationships: {
        'bar': {
          data: { type: 'bars', id: '1' }
        }
      }
    },
    included: [
      {
        type: 'bars',
        id: '1',
        attributes: {},
        relationships: {
          'baz': {
            data: { type: 'bazs', id: '1' }
          }
        }
      },
      {
        type: 'bazs',
        id: '1',
        attributes: {},
        relationships: {
          'quuxes': {
            data: [
              { type: 'quuxes', id: '1' },
              { type: 'quuxes', id: '2' }
            ]
          }
        }
      },
      {
        type: 'quuxes',
        id: '1',
        attributes: {},
        relationships: {
          'zomgs': {
            data: [
              { type: 'zomgs', id: '1' },
              { type: 'zomgs', id: '2' }
            ]
          }
        }
      },
      {
        type: 'quuxes',
        id: '2',
        attributes: {},
        relationships: {
          'zomgs': {
            data: [
              { type: 'zomgs', id: '3' },
              { type: 'zomgs', id: '4' }
            ]
          }
        }
      },
      {
        type: 'zomgs',
        id: '1',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '1' }
          }
        }
      },
      {
        type: 'zomgs',
        id: '2',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '2' }
          }
        }
      },
      {
        type: 'zomgs',
        id: '3',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '3' }
          }
        }
      },
      {
        type: 'zomgs',
        id: '4',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '4' }
          }
        }
      },
      {
        type: 'lols',
        id: '1',
        attributes: {}
      },
      {
        type: 'lols',
        id: '2',
        attributes: {}
      },
      {
        type: 'lols',
        id: '3',
        attributes: {}
      },
      {
        type: 'lols',
        id: '4',
        attributes: {}
      }
    ]
  });
});

test(`dot-paths in the serializer returns related resources`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer.extend({
      include: ['bar.baz.quuxes.zomgs.lol']
    })
  });

  const foo = this.schema.foos.find(1);
  const request = { queryParams: {} };
  const result = registry.serialize(foo, request);

  assert.propEqual(result, {
    data: {
      type: 'foos',
      id: '1',
      attributes: {},
      relationships: {
        'bar': {
          data: { type: 'bars', id: '1' }
        }
      }
    },
    included: [
      {
        type: 'bars',
        id: '1',
        attributes: {},
        relationships: {
          'baz': {
            data: { type: 'bazs', id: '1' }
          }
        }
      },
      {
        type: 'bazs',
        id: '1',
        attributes: {},
        relationships: {
          'quuxes': {
            data: [
              { type: 'quuxes', id: '1' },
              { type: 'quuxes', id: '2' }
            ]
          }
        }
      },
      {
        type: 'quuxes',
        id: '1',
        attributes: {},
        relationships: {
          'zomgs': {
            data: [
              { type: 'zomgs', id: '1' },
              { type: 'zomgs', id: '2' }
            ]
          }
        }
      },
      {
        type: 'quuxes',
        id: '2',
        attributes: {},
        relationships: {
          'zomgs': {
            data: [
              { type: 'zomgs', id: '3' },
              { type: 'zomgs', id: '4' }
            ]
          }
        }
      },
      {
        type: 'zomgs',
        id: '1',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '1' }
          }
        }
      },
      {
        type: 'zomgs',
        id: '2',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '2' }
          }
        }
      },
      {
        type: 'zomgs',
        id: '3',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '3' }
          }
        }
      },
      {
        type: 'zomgs',
        id: '4',
        attributes: {},
        relationships: {
          'lol': {
            data: { type: 'lols', id: '4' }
          }
        }
      },
      {
        type: 'lols',
        id: '1',
        attributes: {}
      },
      {
        type: 'lols',
        id: '2',
        attributes: {}
      },
      {
        type: 'lols',
        id: '3',
        attributes: {}
      },
      {
        type: 'lols',
        id: '4',
        attributes: {}
      }
    ]
  });
});

test(`the include property in the request prevails over any configuration in the serializer (even if empty)`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer.extend({
      include: ['bar.baz.quuxes.zomgs.lol']
    })
  });

  const foo = this.schema.foos.find(1);
  const request = {
    queryParams: { include: 'bar' }
  };
  const result = registry.serialize(foo, request);

  assert.propEqual(result, {
    data: {
      type: 'foos',
      id: '1',
      attributes: {},
      relationships: {
        'bar': {
          data: { type: 'bars', id: '1' }
        }
      }
    },
    included: [
      {
        type: 'bars',
        id: '1',
        attributes: {},
        relationships: {
          'baz': {
            data: { type: 'bazs', id: '1' }
          }
        }
      }
    ]
  });

  const request2 = {
    queryParams: { include: '' }
  };
  const result2 = registry.serialize(foo, request2);
  assert.propEqual(result2, {
    data: {
      type: 'foos',
      id: '1',
      attributes: {},
      relationships: {
        'bar': {
          data: { type: 'bars', id: '1' }
        }
      }
    }
  });
});