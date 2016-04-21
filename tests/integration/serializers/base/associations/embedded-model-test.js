import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Embedded Models', {
  beforeEach() {
    this.schema = schemaHelper.setup();

    let wordSmith = this.schema.wordSmiths.create({ name: 'Link' });
    let post = wordSmith.createBlogPost({ title: 'Lorem' });
    post.createFineComment({ text: 'pwned' });

    wordSmith.createBlogPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda' });

    this.BaseSerializer = Serializer.extend({
      embed: true
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can embed has-many relationships`, function(assert) {
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
      blogPosts: [
        { id: '1', title: 'Lorem' },
        { id: '2', title: 'Ipsum' }
      ]
    }
  });
});

test(`it can embed a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['fineComments']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPosts: [
        { id: '1', title: 'Lorem', fineComments: [
          { id: '1', text: 'pwned' }
        ] },
        { id: '2', title: 'Ipsum', fineComments: [] }
      ]
    }
  });
});

test(`it can embed a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    blogPost: this.BaseSerializer.extend({
      embed: true,
      include: ['wordSmith']
    })
  });

  let blogPost = this.schema.blogPosts.find(1);
  let result = registry.serialize(blogPost);

  assert.deepEqual(result, {
    blogPost: {
      id: '1',
      title: 'Lorem',
      wordSmith: { id: '1', name: 'Link' }
    }
  });
});

test(`it can serialize a chain of belongs-to relationships`, function(assert) {
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
      id: '1',
      text: 'pwned',
      blogPost: {
        id: '1',
        title: 'Lorem',
        wordSmith: {
          id: '1', name: 'Link'
        }
      }
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      include: ['blogPosts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['wordSmith']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPosts: [
        { id: '1', title: 'Lorem' },
        { id: '2', title: 'Ipsum' }
      ]
    }
  });
});

test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      embed: true,
      include: ['blogPosts']
    }),
    blogPost: this.BaseSerializer.extend({
      include: ['word-smith', 'fine-comments']
    }),
    fineComment: this.BaseSerializer.extend({
      include: ['blogPost']
    })
  });

  let wordSmith = this.schema.wordSmiths.find(1);
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPosts: [
        { id: '1', title: 'Lorem', fineComments: [
          { id: '1', text: 'pwned' }
        ] },
        { id: '2', title: 'Ipsum', fineComments: [] }
      ]
    }
  });
});
