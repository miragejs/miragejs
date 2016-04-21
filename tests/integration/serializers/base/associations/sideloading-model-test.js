import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Sideloading Models', {
  beforeEach() {
    this.schema = schemaHelper.setup();

    let wordSmith = this.schema.wordSmiths.create({ name: 'Link' });
    let blogPost = wordSmith.createBlogPost({ title: 'Lorem' });
    blogPost.createFineComment({ text: 'pwned' });

    wordSmith.createBlogPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda' });

    this.BaseSerializer = Serializer.extend({
      embed: false
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it throws an error if embed is false and root is false`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    wordSmith: this.BaseSerializer.extend({
      root: false,
      include: ['blogPosts']
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
      include: ['blogPosts']
    })
  });

  let link = this.schema.wordSmiths.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPostIds: ['1', '2']
    },
    blogPosts: [
      { id: '1', title: 'Lorem', wordSmithId: '1' },
      { id: '2', title: 'Ipsum', wordSmithId: '1' }
    ]
  });
});

test(`it can sideload a model with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['fineComments']
    })
  });

  let link = this.schema.wordSmiths.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPostIds: ['1', '2']
    },
    blogPosts: [
      { id: '1', title: 'Lorem', wordSmithId: '1', fineCommentIds: ['1'] },
      { id: '2', title: 'Ipsum', wordSmithId: '1', fineCommentIds: [] }
    ],
    fineComments: [
      { id: '1', text: 'pwned', blogPostId: '1' }
    ]
  });
});

test(`it avoids circularity when serializing a model`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['wordSmith']
    })
  });

  let link = this.schema.wordSmiths.find(1);
  let result = registry.serialize(link);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPostIds: ['1', '2']
    },
    blogPosts: [
      { id: '1', title: 'Lorem', wordSmithId: '1' },
      { id: '2', title: 'Ipsum', wordSmithId: '1' }
    ]
  });
});

test(`it can sideload a model with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    blogPost: this.BaseSerializer.extend({
      include: ['wordSmith']
    })
  });

  let blogPost = this.schema.blogPosts.find(1);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    blogPost: {
      id: '1', title: 'Lorem', wordSmithId: '1'
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
      include: ['blogPost']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['wordSmith']
    })
  });

  let fineComment = this.schema.fineComments.find(1);
  let result = registry.serialize(fineComment);

  assert.deepEqual(result, {
    fineComment: {
      id: '1', text: 'pwned', blogPostId: '1'
    },
    blogPosts: [
      { id: '1', title: 'Lorem', wordSmithId: '1' }
    ],
    wordSmiths: [
      { id: '1', name: 'Link' }
    ]
  });
});
