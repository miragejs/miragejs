import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Links', {
  beforeEach() {
    this.schema = schemaHelper.setup();

    let link = this.schema.wordSmiths.create({ firstName: 'Link' });
    let blogPost = link.createBlogPost({ title: 'Lorem' });
    blogPost.createFineComment({ text: 'pwned' });

    link.createBlogPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda' });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can link to relationships, omitting 'data'`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      links(model) {
        return {
          'wordSmith': {
            related: `/api/word_smiths/${model.id}`,
            self: `/api/blog_posts/${model.id}/relationships/word_smith`
          },
          'fineComments': {
            related: `/api/fine_comments?blog_post_id=${model.id}`,
            self: `/api/blog_posts/${model.id}/relationships/fine_comments`
          }
        };
      }
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let blogPost = this.schema.blogPosts.find(1);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    data: {
      type: 'blog-posts',
      id: blogPost.id,
      attributes: {
        'title': 'Lorem'
      },
      relationships: {
        'word-smith': {
          links: {
            related: {
              href: `/api/word_smiths/${wordSmith.id}`
            },
            self: {
              href: `/api/blog_posts/${blogPost.id}/relationships/word_smith`
            }
          }
        },
        'fine-comments': {
          links: {
            related: {
              href: `/api/fine_comments?blog_post_id=${blogPost.id}`
            },
            self: {
              href: `/api/blog_posts/${blogPost.id}/relationships/fine_comments`
            }
          }
        }
      }
    }
  });
});
