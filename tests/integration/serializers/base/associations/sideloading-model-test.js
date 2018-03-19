import Schema from 'ember-cli-mirage/orm/schema';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Sideloading Models', function(hooks) {
  hooks.beforeEach(function() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        posts: hasMany('blog-post')
      }),
      blogPost: Model.extend({
        author: belongsTo('word-smith'),
        comments: hasMany('fine-comment')
      }),
      fineComment: Model.extend({
        post: belongsTo('blog-post')
      })
    });

    let wordSmith = this.schema.wordSmiths.create({ name: 'Link' });
    let blogPost = wordSmith.createPost({ title: 'Lorem' });
    blogPost.createComment({ text: 'pwned' });

    wordSmith.createPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda' });

    this.BaseSerializer = Serializer.extend({
      embed: false
    });
  });

  hooks.afterEach(function() {
    this.schema.db.emptyData();
  });

  test(`it throws an error if embed is false and root is false`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      wordSmith: this.BaseSerializer.extend({
        root: false,
        include: ['posts']
      })
    });

    let link = this.schema.wordSmiths.find(1);
    assert.throws(function() {
      registry.serialize(link);
    }, /disables the root/);

  });

  test(`it can sideload a model with a has-many relationship`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        include: ['posts']
      })
    });

    let link = this.schema.wordSmiths.find(1);
    let result = registry.serialize(link);

    assert.deepEqual(result, {
      wordSmith: {
        id: '1',
        name: 'Link',
        postIds: ['1', '2']
      },
      blogPosts: [
        { id: '1', title: 'Lorem' },
        { id: '2', title: 'Ipsum' }
      ]
    });
  });

  test(`it can sideload a model with a chain of has-many relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        include: ['posts']
      }),
      blogPost: this.BaseSerializer.extend({
        include: ['comments']
      })
    });

    let link = this.schema.wordSmiths.find(1);
    let result = registry.serialize(link);

    assert.deepEqual(result, {
      wordSmith: {
        id: '1',
        name: 'Link',
        postIds: ['1', '2']
      },
      blogPosts: [
        { id: '1', title: 'Lorem', commentIds: ['1'] },
        { id: '2', title: 'Ipsum', commentIds: [] }
      ],
      fineComments: [
        { id: '1', text: 'pwned' }
      ]
    });
  });

  test(`it avoids circularity when serializing a model`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        include: ['posts']
      }),
      blogPost: this.BaseSerializer.extend({
        include: ['author']
      })
    });

    let link = this.schema.wordSmiths.find(1);
    let result = registry.serialize(link);

    assert.deepEqual(result, {
      wordSmith: {
        id: '1',
        name: 'Link',
        postIds: ['1', '2']
      },
      blogPosts: [
        { id: '1', title: 'Lorem', authorId: '1' },
        { id: '2', title: 'Ipsum', authorId: '1' }
      ]
    });
  });

  test(`it can sideload a model with a belongs-to relationship`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      blogPost: this.BaseSerializer.extend({
        include: ['author']
      })
    });

    let blogPost = this.schema.blogPosts.find(1);
    let result = registry.serialize(blogPost);

    assert.deepEqual(result, {
      blogPost: {
        id: '1', title: 'Lorem', authorId: '1'
      },
      wordSmiths: [
        { id: '1', name: 'Link' }
      ]
    });
  });

  test(`it can sideload a model with a chain of belongs-to relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      fineComment: this.BaseSerializer.extend({
        include: ['post']
      }),
      blogPost: this.BaseSerializer.extend({
        include: ['author']
      })
    });

    let fineComment = this.schema.fineComments.find(1);
    let result = registry.serialize(fineComment);

    assert.deepEqual(result, {
      fineComment: {
        id: '1', text: 'pwned', postId: '1'
      },
      blogPosts: [
        { id: '1', title: 'Lorem', authorId: '1' }
      ],
      wordSmiths: [
        { id: '1', name: 'Link' }
      ]
    });
  });
});
