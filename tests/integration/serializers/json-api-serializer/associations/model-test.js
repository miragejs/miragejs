import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Model', function(hooks) {
  hooks.beforeEach(function() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo(),
        fineComments: hasMany()
      }),
      fineComment: Model.extend({
        blogPost: belongsTo()
      })
    });
  });

  test(`by default, it doesn't include a model's relationships if those relationships are not included in the document and no links are defined`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer
    });
    let link = this.schema.wordSmiths.create({
      firstName: 'Link',
      age: 123
    });
    let post = link.createBlogPost({ title: 'Lorem ipsum' });

    let result = registry.serialize(post);
    assert.deepEqual(result, {
      data: {
        type: 'blog-posts',
        id: '1',
        attributes: {
          'title': 'Lorem ipsum'
        }
      }
    });
  });

  test(`when alwaysIncludeLinkageData is true, it contains linkage data for all a model's relationships, regardless of includes`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer.extend({
        alwaysIncludeLinkageData: true
      })
    });
    let link = this.schema.wordSmiths.create({
      firstName: 'Link',
      age: 123
    });
    let post = link.createBlogPost({ title: 'Lorem ipsum' });

    let result = registry.serialize(post);
    assert.deepEqual(result, {
      data: {
        type: 'blog-posts',
        id: '1',
        attributes: {
          'title': 'Lorem ipsum'
        },
        relationships: {
          'word-smith': {
            data: {
              type: 'word-smiths',
              id: '1'
            }
          },
          'fine-comments': {
            data: []
          }
        }
      }
    });
  });

  test(`when shouldIncludeLinkageData returns true for a certain belongsTo relationship, it contains linkage data for that relationship, regardless of includes`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer.extend({
        shouldIncludeLinkageData(relationshipKey, model) {
          if (relationshipKey === 'wordSmith') {
            return true;
          }
        }
      })
    });
    let link = this.schema.wordSmiths.create({
      firstName: 'Link',
      age: 123
    });
    let post = link.createBlogPost({ title: 'Lorem ipsum' });

    let result = registry.serialize(post);
    assert.deepEqual(result, {
      data: {
        type: 'blog-posts',
        id: '1',
        attributes: {
          'title': 'Lorem ipsum'
        },
        relationships: {
          'word-smith': {
            data: {
              type: 'word-smiths',
              id: '1'
            }
          }
        }
      }
    });
  });

  test(`when shouldIncludeLinkageData returns true for a certain hasMany relationship, it contains linkage data for that relationship, regardless of includes`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        shouldIncludeLinkageData(relationshipKey, model) {
          if (relationshipKey === 'blogPosts') {
            return true;
          }
        }
      })
    });

    let link = this.schema.wordSmiths.create({ firstName: 'Link' });
    link.createBlogPost({ title: 'Lorem' });
    link.createBlogPost({ title: 'Ipsum' });

    let result = registry.serialize(link);

    assert.deepEqual(result, {
      data: {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      }
    });
  });

  test(`it includes linkage data for a has-many relationship that's being included`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        include: ['blogPosts']
      })
    });

    let link = this.schema.wordSmiths.create({ firstName: 'Link' });
    link.createBlogPost({ title: 'Lorem' });
    link.createBlogPost({ title: 'Ipsum' });

    let result = registry.serialize(link);

    assert.deepEqual(result, {
      data: {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      },
      included: [
        {
          type: 'blog-posts',
          id: '1',
          attributes: {
            title: 'Lorem'
          }
        },
        {
          type: 'blog-posts',
          id: '2',
          attributes: {
            title: 'Ipsum'
          }
        }
      ]
    });
  });

  test(`it can include a chain of has-many relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        include: ['blogPosts']
      }),
      blogPost: JSONAPISerializer.extend({
        include: ['fineComments']
      })
    });

    let link = this.schema.wordSmiths.create({ firstName: 'Link' });
    let post1 = link.createBlogPost({ title: 'Lorem' });
    post1.createFineComment({ text: 'pwned' });
    link.createBlogPost({ title: 'Ipsum' });

    let result = registry.serialize(link);

    assert.deepEqual(result, {
      data: {
        type: 'word-smiths',
        id: '1',
        attributes: {
          'first-name': 'Link'
        },
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        }
      },
      included: [
        {
          type: 'blog-posts',
          id: '1',
          attributes: {
            title: 'Lorem'
          },
          relationships: {
            'fine-comments': {
              data: [
                { type: 'fine-comments', id: '1' }
              ]
            }
          }
        },
        {
          type: 'fine-comments',
          id: '1',
          attributes: {
            text: 'pwned'
          }
        },
        {
          type: 'blog-posts',
          id: '2',
          attributes: {
            title: 'Ipsum'
          },
          relationships: {
            'fine-comments': {
              data: []
            }
          }
        }
      ]
    });
  });

  test(`it can include a belongs-to relationship`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      blogPost: JSONAPISerializer.extend({
        include: ['wordSmith']
      })
    });

    let link = this.schema.wordSmiths.create({ firstName: 'Link' });
    let blogPost = link.createBlogPost({ title: 'Lorem' });
    blogPost.createFineComment();

    let result = registry.serialize(blogPost);

    assert.deepEqual(result, {
      data: {
        type: 'blog-posts',
        id: '1',
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'word-smith': {
            data: {
              id: '1',
              type: 'word-smiths'
            }
          }
        }
      },
      'included': [
        {
          attributes: {
            'first-name': 'Link'
          },
          id: '1',
          type: 'word-smiths'
        }
      ]
    });
  });

  test(`it gracefully handles null belongs-to relationship`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      blogPost: JSONAPISerializer.extend({
        include: ['wordSmith']
      })
    });

    let blogPost = this.schema.blogPosts.create({ title: 'Lorem' });
    let result = registry.serialize(blogPost);

    assert.deepEqual(result, {
      data: {
        type: 'blog-posts',
        id: '1',
        attributes: {
          title: 'Lorem'
        },
        relationships: {
          'word-smith': {
            data: null
          }
        }
      }
    });
  });

  test(`it can include a chain of belongs-to relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      blogPost: JSONAPISerializer.extend({
        include: ['wordSmith']
      }),
      fineComment: JSONAPISerializer.extend({
        include: ['blogPost']
      })
    });

    let wordSmith = this.schema.wordSmiths.create({ firstName: 'Link' });
    let post = wordSmith.createBlogPost({ title: 'Lorem' });
    let comment = post.createFineComment({ text: 'pwned' });

    let result = registry.serialize(comment);

    assert.deepEqual(result, {
      data: {
        type: 'fine-comments',
        id: '1',
        attributes: {
          text: 'pwned'
        },
        relationships: {
          'blog-post': {
            data: {
              id: '1',
              type: 'blog-posts'
            }
          }
        }
      },
      'included': [
        {
          type: 'blog-posts',
          id: '1',
          attributes: {
            title: 'Lorem'
          },
          relationships: {
            'word-smith': {
              data: {
                type: 'word-smiths',
                id: '1'
              }
            }
          }
        },
        {
          type: 'word-smiths',
          id: '1',
          attributes: {
            'first-name': 'Link'
          }
        }
      ]
    });
  });

  test(`it properly serializes complex relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        include: ['blogPosts']
      }),
      blogPost: JSONAPISerializer.extend({
        include: ['wordSmith', 'fineComments']
      }),
      fineComment: JSONAPISerializer.extend({
        include: ['blogPost']
      })
    });

    let wordSmith = this.schema.wordSmiths.create({ firstName: 'Link' });
    let post = wordSmith.createBlogPost({ title: 'Lorem' });
    wordSmith.createBlogPost({ title: 'Ipsum' });
    post.createFineComment({ text: 'pwned' });

    let result = registry.serialize(wordSmith);

    assert.deepEqual(result, {
      data: {
        attributes: {
          'first-name': 'Link'
        },
        id: '1',
        relationships: {
          'blog-posts': {
            data: [
              { type: 'blog-posts', id: '1' },
              { type: 'blog-posts', id: '2' }
            ]
          }
        },
        type: 'word-smiths'
      },
      included: [
        {
          type: 'blog-posts',
          id: '1',
          attributes: {
            title: 'Lorem'
          },
          relationships: {
            'word-smith': {
              data: { type: 'word-smiths', id: '1' }
            },
            'fine-comments': {
              data: [
                { type: 'fine-comments', id: '1' }
              ]
            }
          }
        },
        {
          type: 'fine-comments',
          id: '1',
          attributes: {
            text: 'pwned'
          },
          relationships: {
            'blog-post': {
              data: { type: 'blog-posts', id: '1' }
            }
          }
        },
        {
          type: 'blog-posts',
          id: '2',
          attributes: {
            title: 'Ipsum'
          },
          relationships: {
            'word-smith': {
              data: { type: 'word-smiths', id: '1' }
            },
            'fine-comments': {
              data: []
            }
          }
        }
      ]
    });
  });
});
