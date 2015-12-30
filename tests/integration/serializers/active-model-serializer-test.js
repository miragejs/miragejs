import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';
import { hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializer | ActiveModelSerializer', {
  beforeEach: function() {
    let db = new Db();
    this.schema = new Schema(db);
    this.schema.registerModels({
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo()
      })
    });

    let link = this.schema.wordSmith.create({name: 'Link', age: 123});
    link.createBlogPost({title: 'Lorem'});
    link.createBlogPost({title: 'Ipsum'});

    this.schema.wordSmith.create({name: 'Zelda', age: 230});

    this.registry = new SerializerRegistry(this.schema, {
      application: ActiveModelSerializer,
      wordSmith: ActiveModelSerializer.extend({
        attrs: ['id', 'name'],
        include: ['blogPosts']
      })
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test('it sideloads associations and snake-cases relationships and attributes correctly for a model', function(assert) {
  let link = this.schema.wordSmith.find(1);
  let result = this.registry.serialize(link);

  assert.deepEqual(result, {
    word_smith: {
      id: '1',
      name: 'Link',
      blog_post_ids: ['1', '2']
    },
    blog_posts: [
      {
        id: '1',
        title: 'Lorem',
        word_smith_id: '1'
      },
      {
        id: '2',
        title: 'Ipsum',
        word_smith_id: '1'
      }
    ]
  });
});


test('it sideloads associations and snake-cases relationships and attributes correctly for a collection', function(assert) {
  let wordSmiths = this.schema.wordSmith.all();
  let result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    word_smiths: [
      {
        id: '1',
        name: 'Link',
        blog_post_ids: ['1', '2']
      },
      {
        id: '2',
        name: 'Zelda',
        blog_post_ids: []
      }
    ],
    blog_posts: [
      {
        id: '1',
        title: 'Lorem',
        word_smith_id: '1'
      },
      {
        id: '2',
        title: 'Ipsum',
        word_smith_id: '1'
      }
    ]
  });
});

