import { ActiveModelSerializer, Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializer | ActiveModelSerializer', function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db();
    this.schema = new Schema(db);
    this.schema.registerModels({
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo(),
        comments: hasMany()
      }),
      user: Model.extend({
        contactInfos: hasMany()
      }),
      contactInfo: Model.extend({
        user: belongsTo()
      }),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true })
      })
    });

    let link = this.schema.wordSmiths.create({ name: 'Link', age: 123 });
    let post1 = link.createBlogPost({ title: 'Lorem' });
    link.createBlogPost({ title: 'Ipsum' });

    this.schema.wordSmiths.create({ name: 'Zelda', age: 230 });

    let user = this.schema.users.create({ name: 'John Peach', age: 123 });
    user.createContactInfo({ email: 'peach@bb.me' });
    user.createContactInfo({ email: 'john3000@mail.com' });

    this.schema.users.create({ name: 'Pine Apple', age: 230 });
    this.schema.comments.create({ text: 'Hi there', commentable: post1 });

    this.registry = new SerializerRegistry(this.schema, {
      application: ActiveModelSerializer,
      wordSmith: ActiveModelSerializer.extend({
        serializeIds: 'included',
        attrs: ['id', 'name'],
        include: ['blogPosts']
      }),
      blogPost: ActiveModelSerializer.extend({
        serializeIds: 'included',
        include: ['wordSmith', 'comments']
      }),
      comment: ActiveModelSerializer.extend({
        serializeIds: 'included',
        include: ['commentable']
      }),
      contactInfo: ActiveModelSerializer.extend({
        serializeIds: 'included',
        include: ['user']
      }),
      user: ActiveModelSerializer.extend({
        serializeIds: 'included',
        attrs: ['id', 'name'],
        include: ['contactInfos'],
        embed: true
      })
    });
  });

  hooks.afterEach(function() {
    this.schema.db.emptyData();
  });

  test('it sideloads associations and snake-cases relationships and attributes correctly for a model', function(assert) {
    let link = this.schema.wordSmiths.find(1);
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
          word_smith_id: '1',
          comment_ids: [ '1' ]
        },
        {
          id: '2',
          title: 'Ipsum',
          word_smith_id: '1',
          comment_ids: [ ]
        }
      ],
      comments: [
        {
          id: '1',
          text: 'Hi there',
          commentable_id: '1',
          commentable_type: 'blog-post'
        }
      ]
    });
  });

  test('it sideloads associations and snake-cases relationships and attributes correctly for a collection', function(assert) {
    let wordSmiths = this.schema.wordSmiths.all();
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
          word_smith_id: '1',
          comment_ids: [ '1' ]
        },
        {
          id: '2',
          title: 'Ipsum',
          word_smith_id: '1',
          comment_ids: [ ]
        }
      ],
      comments: [
        {
          id: '1',
          text: 'Hi there',
          commentable_id: '1',
          commentable_type: 'blog-post'
        }
      ]
    });
  });

  test('it embeds associations and snake-cases relationships and attributes correctly for a collection', function(assert) {
    let users = this.schema.users.all();
    let result = this.registry.serialize(users);

    assert.deepEqual(result, {
      users: [
        {
          id: '1',
          name: 'John Peach',
          contact_infos: [
            {
              id: '1',
              email: 'peach@bb.me',
              user_id: '1'
            },
            {
              id: '2',
              email: 'john3000@mail.com',
              user_id: '1'
            }
          ]
        },
        {
          id: '2',
          name: 'Pine Apple',
          contact_infos: []
        }
      ]
    });
  });
});
