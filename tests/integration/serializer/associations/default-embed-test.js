import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializer | Associations | Default Embed', {
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

test(`it defaults to sideloaded (embed is false)`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      relationships: ['posts'],
    })
  });

  let link = this.schema.author.find(1);
  var result = registry.serialize(link);

  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
      postIds: [1, 2]
    },
    posts: [
      {id: 1, title: 'Lorem', authorId: 1},
      {id: 2, title: 'Ipsum', authorId: 1}
    ]
  });
});
