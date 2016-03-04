import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Links', {
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

test(`it can link to relationships, omitting 'data'`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    wordSmith: JsonApiSerializer.extend({
      links(model) {
        return {
          'blogPosts': {
            related: `/api/blog_posts?word_smith_id=${model.id}`,
            self: `/api/word_smiths/${model.id}/relationships/blog_posts`
          }
        };
      }
    })
  });

  let wordSmith = this.schema.wordSmith.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link',
      },
      relationships: {
        'blog-posts': {
          links: {
            related: {
              href: `/api/blog_posts?word_smith_id=${wordSmith.id}`
            },
            self: {
              href: `/api/word_smiths/${wordSmith.id}/relationships/blog_posts`
            }
          }
        }
      }
    }
  });
});
