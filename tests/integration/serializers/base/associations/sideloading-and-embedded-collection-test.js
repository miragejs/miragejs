import Schema from 'ember-cli-mirage/orm/schema';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Sideloading and Embedded Collections', function(hooks) {
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

  test(`it can sideload a collection with a has-many relationship containing embedded models`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      wordSmith: this.BaseSerializer.extend({
        embed: false,
        include: ["posts"]
      }),
      blogPost: this.BaseSerializer.extend({
        embed: true,
        include: ["comments"]
      })
    });

    let wordSmiths = this.schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    assert.deepEqual(result, {
      wordSmiths: [
        { id: "1", name: "Link", postIds: ["1", "2"] },
        { id: "2", name: "Zelda", postIds: ["3"] }
      ],
      blogPosts: [
        { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
        { id: "2", title: "Ipsum", comments: [] },
        { id: "3", title: "Zeldas blogPost", comments: [] }
      ]
    });
  });

  test(`it can sideload a collection with a belongs-to relationship containing embedded models`, function(assert) {
    let registry = new SerializerRegistry(this.schema, {
      application: this.BaseSerializer,
      fineComment: this.BaseSerializer.extend({
        embed: false,
        include: ["post"]
      }),
      blogPost: this.BaseSerializer.extend({
        embed: true,
        include: ["author"]
      })
    });

    let fineComments = this.schema.fineComments.all();
    let result = registry.serialize(fineComments);

    assert.deepEqual(result, {
      fineComments: [{ id: "1", text: "pwned", postId: "1" }],
      blogPosts: [
        {
          id: "1",
          title: "Lorem",
          author: { id: "1", name: "Link" }
        }
      ]
    });
  });
});
