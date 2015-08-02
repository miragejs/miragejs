import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('mirage:serializer:associations sideloading', {
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

test(`when embed is false it sideloads relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    author: Serializer.extend({
      embed: false,
      relationships: ['posts'],
    })
  });

  let link = this.schema.author.find(1);
  var result = registry.serialize(link);

  assert.deepEqual(result, {
    authors: {
      id: 1,
      name: 'Link',
      post_ids: [1, 2]
    },
    posts: [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1}
    ]
  });
});

// test(`error is thrown when embed is false and root is false`, function(assert) {
// });
