import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Attrs List', {
  beforeEach() {
    this.schema = schemaHelper.setup();
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  this.registry = new SerializerRegistry(this.schema, {
    wordSmith: JsonApiSerializer.extend({
      attrs: ['id', 'firstName']
    })
  });
  let user = this.schema.wordSmiths.create({
    id: 1,
    firstName: 'Link',
    age: 123
  });

  let result = this.registry.serialize(user);
  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      },
      relationships: {
        'blog-posts': {
          data: []
        }
      }
    }
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  this.registry = new SerializerRegistry(this.schema, {
    wordSmith: JsonApiSerializer.extend({
      attrs: ['id', 'firstName']
    })
  });
  let { schema } = this;
  schema.wordSmiths.create({ id: 1, firstName: 'Link', age: 123 });
  schema.wordSmiths.create({ id: 2, firstName: 'Zelda', age: 456 });

  let collection = this.schema.wordSmiths.all();
  let result = this.registry.serialize(collection);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
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
        'first-name': 'Zelda'
      },
      relationships: {
        'blog-posts': {
          data: []
        }
      }
    }]
  });
});

test(`it can use different attr whitelists for different serializers`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    wordSmith: JsonApiSerializer.extend({
      attrs: ['id', 'firstName'],
      include: ['blogPosts']
    }),
    blogPost: JsonApiSerializer.extend({
      attrs: ['id', 'title']
    })
  });
  let link = this.schema.wordSmiths.create({ id: 1, firstName: 'Link', age: 123 });
  link.createBlogPost({ title: 'A whole new world' });

  let result = registry.serialize(this.schema.wordSmiths.all());

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      },
      relationships: {
        'blog-posts': {
          data: [
            { type: 'blog-posts', id: '1' }
          ]
        }
      }
    }],
    included: [
      {
        'attributes': {
          'title': 'A whole new world'
        },
        'id': '1',
        'relationships': {
          'fine-comments': {
            'data': []
          },
          'word-smith': {
            'data': { type: 'word-smiths', id: '1' }
          }
        },
        'type': 'blog-posts'
      }
    ]
  });
});
