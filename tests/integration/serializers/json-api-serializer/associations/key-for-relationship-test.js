// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, hasMany, JSONAPISerializer } from 'ember-cli-mirage';
import { underscore } from 'ember-cli-mirage/utils/inflector';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Key for relationship', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model
    });
  }
});

test(`keyForRelationship works`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer.extend({
      keyForRelationship(key) {
        return underscore(key);
      }
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
    }
  });
});
