// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../schema-helper';
import { underscore } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

module('Integration | Serializers | JSON API Serializer | Key Formatting', {
  beforeEach() {
    this.schema = schemaHelper.setup();
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`keyForAttribute formats the attributes of a model`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer.extend({
      keyForAttribute: underscore
    })
  });
  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    firstName: 'Link',
    lastName: 'Jackson',
    age: 323
  });

  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        age: 323,
        first_name: 'Link',
        last_name: 'Jackson'
      },
      relationships: {
        'blog-posts': {
          data: []
        }
      }
    }
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer.extend({
      keyForAttribute: underscore
    })
  });

  this.schema.wordSmiths.create({ id: 1, 'firstName': 'Link', 'lastName': 'Jackson' });
  this.schema.wordSmiths.create({ id: 2, 'firstName': 'Zelda', 'lastName': 'Brown' });
  let wordSmiths = this.schema.wordSmiths.all();

  let result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first_name': 'Link',
        'last_name': 'Jackson'
      },
      relationships: {
        'blog-posts': {
          data: []
        }
      }
    }, {
      type: 'word-smiths',
      id: '2',
      attributes: {
        'first_name': 'Zelda',
        'last_name': 'Brown'
      },
      relationships: {
        'blog-posts': {
          data: []
        }
      }
    }]
  });
});

test(`keyForRelationship works`, function(assert) {
  let ApplicationSerializer = JsonApiSerializer.extend({
    keyForRelationship: underscore
  });
  let registry = new SerializerRegistry(this.schema, {
    application: ApplicationSerializer,
    wordSmith: ApplicationSerializer.extend({
      include: ['blogPosts']
    })
  });
  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    firstName: 'Link',
    lastName: 'Jackson',
    age: 323
  });
  wordSmith.createBlogPost({ title: 'Lorem ipsum' });

  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        age: 323,
        'first-name': 'Link',
        'last-name': 'Jackson'
      },
      relationships: {
        'blog_posts': {
          data: [
            { id: '1', type: 'blog-posts' }
          ]
        }
      }
    },
    included: [
      {
        attributes: {
          title: 'Lorem ipsum'
        },
        id: '1',
        relationships: {
          fine_comments: {
            data: []
          },
          word_smith: {
            data: {
              type: 'word-smiths',
              id: '1'
            }
          }
        },
        type: 'blog-posts'
      }
    ]
  });
});
