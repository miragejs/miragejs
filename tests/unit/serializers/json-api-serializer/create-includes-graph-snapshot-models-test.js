import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import { module, test } from 'qunit';

/*
  This test is heavily coupled to the implementation and can be deleted
  during a future refactoring.
*/
module('Unit | Serializers | JSON API Serializer | #_createIncludesGraphSnapshot models', function(hooks) {
  hooks.beforeEach(function() {
    let serializer;
    let registry = {
      serializerFor() {
        return serializer;
      }
    };
    let type = 'foo';
    let request = {};

    serializer = new JSONAPISerializer(registry, type, request);
    this.serializer = serializer;
  });

  test('it works on models with no includes', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
      })
    });
    let wordSmith = schema.wordSmiths.create();

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {}
      }
    });
  });

  test("it doesn't choke on an empty belongsTo relationship", function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPost: belongsTo()
      }),
      blogPost: Model.extend({
        happyCategory: belongsTo()
      }),
      happyCategory: Model.extend()
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createBlogPost();

    this.serializer.request = { queryParams: { include: 'blog-post.happy-category' } };

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'blog-post': 'blog-post:1'
          }
        }
      },
      included: {
        'blog-posts': {
          'blog-post:1': {
            relationships: {
              'happy-category': undefined
            }
          }
        }
      }
    });
  });

  test('it works on models with belongsTo relationships', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTag: belongsTo(),
        bluePost: belongsTo()
      }),
      bluePost: Model.extend({
        redTag: belongsTo()
      }),
      redTag: Model.extend()
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    bluePost.createRedTag();

    this.serializer.request = { queryParams: { include: 'red-tag,blue-post' } };

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'red-tag': 'red-tag:1',
            'blue-post': 'blue-post:1'
          }
        }
      },
      included: {
        'red-tags': {
          'red-tag:1': {
          }
        },
        'blue-posts': {
          'blue-post:1': {
          }
        }
      }
    });
  });

  test('it works on models with belongsTo relationships and dot-path includes', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTag: belongsTo(),
        bluePost: belongsTo()
      }),
      bluePost: Model.extend({
        redTag: belongsTo()
      }),
      redTag: Model.extend({
        someColor: belongsTo()
      }),
      someColor: Model.extend({
      })
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    let redTag = bluePost.createRedTag();
    redTag.createSomeColor();

    this.serializer.request = { queryParams: { include: 'red-tag,blue-post.red-tag.some-color' } };

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'red-tag': 'red-tag:1',
            'blue-post': 'blue-post:1'
          }
        }
      },
      included: {
        'red-tags': {
          'red-tag:1': {
          },
          'red-tag:2': {
            relationships: {
              'some-color': 'some-color:1'
            }
          }
        },
        'blue-posts': {
          'blue-post:1': {
            relationships: {
              'red-tag': 'red-tag:2'
            }
          }
        },
        'some-colors': {
          'some-color:1': {}
        }
      }
    });
  });

  test('it works on models with hasMany relationships', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTags: hasMany(),
        bluePosts: hasMany()
      }),
      bluePost: Model.extend({
        redTags: hasMany()
      }),
      redTag: Model.extend()
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    bluePost.createRedTag();

    this.serializer.request = { queryParams: { include: 'red-tags,blue-posts' } };

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'red-tags': [ 'red-tag:1', 'red-tag:2' ],
            'blue-posts': [ 'blue-post:1' ]
          }
        }
      },
      included: {
        'red-tags': {
          'red-tag:1': {
          },
          'red-tag:2': {
          }
        },
        'blue-posts': {
          'blue-post:1': {
          }
        }
      }
    });
  });

  test('it works on models with hasMany relationships and dot-path includes', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTags: hasMany(),
        bluePosts: hasMany()
      }),
      bluePost: Model.extend({
        redTags: hasMany()
      }),
      redTag: Model.extend({
        someColors: hasMany()
      }),
      someColor: Model.extend()
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    let redTag = bluePost.createRedTag();
    redTag.createSomeColor();

    this.serializer.request = { queryParams: { include: 'red-tags,blue-posts.red-tags.some-colors' } };

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'red-tags': [ 'red-tag:1', 'red-tag:2' ],
            'blue-posts': [ 'blue-post:1' ]
          }
        }
      },
      included: {
        'red-tags': {
          'red-tag:1': {},
          'red-tag:2': {},
          'red-tag:3': {
            relationships: {
              'some-colors': [ 'some-color:1' ]
            }
          }
        },
        'blue-posts': {
          'blue-post:1': {
            relationships: {
              'red-tags': [ 'red-tag:3' ]
            }
          }
        },
        'some-colors': {
          'some-color:1': {}
        }
      }
    });
  });
});
