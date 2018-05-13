import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

/*
  This test is heavily coupled to the implementation and can be deleted
  during a future refactoring.
*/
module('Unit | Serializers | JSON API Serializer | #_createIncludesGraphSnapshot mixed', function(hooks) {
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

  test('it works on models and collections with dot-path includes', function(assert) {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        happyTag: belongsTo()
      }),
      happyTag: Model.extend({
        happyColor: belongsTo()
      }),
      happyColor: Model.extend()
    });
    let wordSmith = schema.wordSmiths.create();
    let blogPost1 = wordSmith.createBlogPost();
    let happyTag = blogPost1.createHappyTag();
    happyTag.createHappyColor();

    let blogPost2 = wordSmith.createBlogPost();
    let happyTag2 = blogPost2.createHappyTag();
    happyTag2.createHappyColor();

    this.serializer.request = { queryParams: { include: 'blog-posts.happy-tag.happy-color' } };

    this.serializer._createRequestedIncludesGraph(wordSmith);

    assert.deepEqual(this.serializer.request._includesGraph, {
      data: {
        'word-smith:1': {
          relationships: {
            'blog-posts': [ 'blog-post:1', 'blog-post:2' ]
          }
        }
      },
      included: {
        'blog-posts': {
          'blog-post:1': {
            relationships: {
              'happy-tag': 'happy-tag:1'
            }
          },
          'blog-post:2': {
            relationships: {
              'happy-tag': 'happy-tag:2'
            }
          }
        },
        'happy-tags': {
          'happy-tag:1': {
            relationships: {
              'happy-color': 'happy-color:1'
            }
          },
          'happy-tag:2': {
            relationships: {
              'happy-color': 'happy-color:2'
            }
          }
        },
        'happy-colors': {
          'happy-color:1': {},
          'happy-color:2': {}
        }
      }
    });
  });
});
