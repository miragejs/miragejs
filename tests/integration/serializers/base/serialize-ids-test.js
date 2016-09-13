import { module, test } from 'qunit';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Serializer, Model, hasMany } from 'ember-cli-mirage';

module('Integration | Serializers | Base | Serialize ids', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany(),
        specialPosts: hasMany('blog-post', { inverse: 'specialAuthor' })
      }),
      blogPost: Model
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`if serializeIds is 'include' it serializes ids of hasMany associations that are included`, function(assert) {
  let ApplicationSerializer = Serializer.extend({
    serializeIds: 'included'
  });
  let registry = new SerializerRegistry(this.schema, {
    application: ApplicationSerializer,
    wordSmith: ApplicationSerializer.extend({
      include: ['blogPosts']
    })
  });

  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    name: 'Link'
  });
  wordSmith.createBlogPost();
  wordSmith.createBlogPost();
  wordSmith.createSpecialPost();
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPostIds: ['1', '2']
    },
    blogPosts: [
      {
        id: '1',
        specialAuthorId: null,
        wordSmithId: '1'
      },
      {
        id: '2',
        specialAuthorId: null,
        wordSmithId: '1'
      }
    ]
  });
});

test(`if serializeIds is 'always' it serializes ids of all hasMany associations`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: Serializer.extend({
      serializeIds: 'always'
    })
  });

  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    name: 'Link'
  });
  wordSmith.createBlogPost();
  wordSmith.createBlogPost();
  wordSmith.createSpecialPost();
  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link',
      blogPostIds: ['1', '2'],
      specialPostIds: ['3']
    }
  });
});
