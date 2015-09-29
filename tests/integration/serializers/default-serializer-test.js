import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Default serializer for registry', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let author = this.schema.author.create({name: 'Link'});
    let post = author.createPost({title: 'Lorem'});
    post.createComment({text: 'pwned'});

    author.createPost({title: 'Ipsum'});

    this.schema.author.create({name: 'Zelda'});
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`registry defaults to ActiveModelSerializer`, function(assert) {
  let registry = new SerializerRegistry(this.schema);

  var result = registry.serialize(this.schema.post.all());

  assert.deepEqual(result, {
    posts: [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1}
    ]
  });
});
