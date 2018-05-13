import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';
import { Model, hasMany } from 'ember-cli-mirage';

/*
  This test is heavily coupled to the implementation and can be deleted
  during a future refactoring.
*/
module('Unit | Serializers | JSON API Serializer | #_createIncludesGraphSnapshot collections', function(hooks) {
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

  test('it works on collections with no includes', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
      })
    });
    schema.wordSmiths.create();
    schema.wordSmiths.create();

    this.serializer._createRequestedIncludesGraph(schema.wordSmiths.all());

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {},
        'word-smith:2': {}
      }
    });
  });

  test('it works on collections with hasMany relationships and dot-path includes', function(assert) {
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
    let wordSmith1 = schema.wordSmiths.create();
    wordSmith1.createRedTag();
    wordSmith1.createRedTag();

    let bluePost = wordSmith1.createBluePost();
    let redTag = bluePost.createRedTag();
    redTag.createSomeColor();

    let wordSmith2 = schema.wordSmiths.create();
    wordSmith2.createRedTag();

    let bluePost2 = wordSmith2.createBluePost();
    let redTag2 = bluePost2.createRedTag();
    redTag2.createSomeColor();

    this.serializer.request = { queryParams: { include: 'red-tags,blue-posts.red-tags.some-colors' } };

    this.serializer._createRequestedIncludesGraph(schema.wordSmiths.all());

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'red-tags': [ 'red-tag:1', 'red-tag:2' ],
            'blue-posts': [ 'blue-post:1' ]
          }
        },
        'word-smith:2': {
          relationships: {
            'red-tags': [ 'red-tag:4' ],
            'blue-posts': [ 'blue-post:2' ]
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
          },
          'red-tag:4': {},
          'red-tag:5': {
            relationships: {
              'some-colors': [ 'some-color:2' ]
            }
          }
        },
        'blue-posts': {
          'blue-post:1': {
            relationships: {
              'red-tags': [ 'red-tag:3' ]
            }
          },
          'blue-post:2': {
            relationships: {
              'red-tags': [ 'red-tag:5' ]
            }
          }
        },
        'some-colors': {
          'some-color:1': {},
          'some-color:2': {}
        }
      }
    });
  });
});
