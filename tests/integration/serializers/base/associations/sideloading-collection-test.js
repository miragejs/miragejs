import Schema from 'ember-cli-mirage/orm/schema';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Sideloading Collections', function(hooks) {
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

    let link = this.schema.wordSmiths.create({ name: 'Link' });
    let blogPost = link.createPost({ title: 'Lorem' });
    link.createPost({ title: 'Ipsum' });

    blogPost.createComment({ text: 'pwned' });

    let zelda = this.schema.wordSmiths.create({ name: 'Zelda' });
    zelda.createPost({ title: `Zeldas blogPost` });

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

    let wordSmiths = this.schema.wordSmiths.all();

    assert.throws(function() {
      registry.serialize(wordSmiths);
    }, /disables the root/);
  });

  test(`it can sideload an empty collection`, function(assert) {
    this.schema.db.emptyData();
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        include: ['posts']
      })
    });

    let result = registry.serialize(this.schema.wordSmiths.all());

    assert.deepEqual(result, {
      wordSmiths: []
    });
  });

  test(`it can sideload a collection with a has-many relationship`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        embed: false,
        include: ['posts']
      })
    });

    let wordSmiths = this.schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    assert.deepEqual(result, {
      wordSmiths: [
        { id: '1', name: 'Link', postIds: ['1', '2'] },
        { id: '2', name: 'Zelda', postIds: ['3'] }
      ],
      blogPosts: [
        { id: '1', title: 'Lorem' },
        { id: '2', title: 'Ipsum' },
        { id: '3', title: 'Zeldas blogPost' }
      ]
    });
  });

  test(`it can sideload a collection with a chain of has-many relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        embed: false,
        include: ['posts']
      }),
      blogPost: this.BaseSerializer.extend({
        include: ['comments']
      })
    });

    let wordSmiths = this.schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    assert.deepEqual(result, {
      wordSmiths: [
        { id: '1', name: 'Link', postIds: ['1', '2'] },
        { id: '2', name: 'Zelda', postIds: ['3'] }
      ],
      blogPosts: [
        { id: '1', title: 'Lorem', commentIds: ['1'] },
        { id: '2', title: 'Ipsum', commentIds: [] },
        { id: '3', title: 'Zeldas blogPost', commentIds: [] }
      ],
      fineComments: [
        { id: '1', text: 'pwned' }
      ]
    });
  });

  test(`it avoids circularity when serializing a collection`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        embed: false,
        include: ['posts']
      }),
      blogPost: this.BaseSerializer.extend({
        include: ['author']
      })
    });

    let wordSmiths = this.schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    assert.deepEqual(result, {
      wordSmiths: [
        { id: '1', name: 'Link', postIds: ['1', '2'] },
        { id: '2', name: 'Zelda', postIds: ['3'] }
      ],
      blogPosts: [
        { id: '1', title: 'Lorem', authorId: '1' },
        { id: '2', title: 'Ipsum', authorId: '1' },
        { id: '3', title: 'Zeldas blogPost', authorId: '2' }
      ]
    });
  });

  test(`it can sideload a collection with a belongs-to relationship`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      blogPost: this.BaseSerializer.extend({
        embed: false,
        include: ['author']
      })
    });

    let blogPosts = this.schema.blogPosts.all();
    let result = registry.serialize(blogPosts);

    assert.deepEqual(result, {
      blogPosts: [
        { id: '1', title: 'Lorem', authorId: '1' },
        { id: '2', title: 'Ipsum', authorId: '1' },
        { id: '3', title: 'Zeldas blogPost', authorId: '2' }
      ],
      wordSmiths: [
        { id: '1', name: 'Link' },
        { id: '2', name: 'Zelda' }
      ]
    });
  });

  test(`it can sideload a collection with a chain of belongs-to relationships`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      fineComment: this.BaseSerializer.extend({
        embed: false,
        include: ['post']
      }),
      blogPost: this.BaseSerializer.extend({
        include: ['author']
      })
    });

    let fineComments = this.schema.fineComments.all();
    let result = registry.serialize(fineComments);

    assert.deepEqual(result, {
      fineComments: [
        { id: '1', text: 'pwned', postId: '1' }
      ],
      blogPosts: [
        { id: '1', title: 'Lorem', authorId: '1' }
      ],
      wordSmiths: [
        { id: '1', name: 'Link' }
      ]
    });
  });
});
