import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Default serializer for registry', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let wordSmith = this.schema.wordSmith.create({name: 'Link'});
    let blogPost = wordSmith.createBlogPost({title: 'Lorem'});
    blogPost.createFineComment({text: 'pwned'});

    wordSmith.createBlogPost({title: 'Ipsum'});

    this.schema.wordSmith.create({name: 'Zelda'});
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`registry defaults to ActiveModelSerializer`, function(assert) {
  let registry = new SerializerRegistry(this.schema);

  var result = registry.serialize(this.schema.blogPost.all());

  assert.deepEqual(result, {
    blogPosts: [
      {id: 1, title: 'Lorem', word_smith_id: 1},
      {id: 2, title: 'Ipsum', word_smith_id: 1}
    ]
  });
});
