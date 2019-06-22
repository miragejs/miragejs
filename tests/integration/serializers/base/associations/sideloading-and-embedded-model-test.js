import Schema from "ember-cli-mirage/orm/schema";
import { Model, hasMany, belongsTo } from "ember-cli-mirage";
import Db from "ember-cli-mirage/db";
import Serializer from "ember-cli-mirage/serializer";
import SerializerRegistry from "ember-cli-mirage/serializer-registry";
import { module, test } from "qunit";

module(
  "Integration | Serializers | Base | Associations | Sideloading and Embedded Models",
  function(hooks) {
    hooks.beforeEach(function() {
      this.schema = new Schema(new Db(), {
        wordSmith: Model.extend({
          posts: hasMany("blog-post")
        }),
        blogPost: Model.extend({
          author: belongsTo("word-smith"),
          comments: hasMany("fine-comment")
        }),
        fineComment: Model.extend({
          post: belongsTo("blog-post")
        })
      });

      let wordSmith = this.schema.wordSmiths.create({ name: "Link" });
      let blogPost = wordSmith.createPost({ title: "Lorem" });
      blogPost.createComment({ text: "pwned" });

      wordSmith.createPost({ title: "Ipsum" });

      this.schema.wordSmiths.create({ name: "Zelda" });

      this.BaseSerializer = Serializer.extend({
        embed: false
      });
    });

    hooks.afterEach(function() {
      this.schema.db.emptyData();
    });

    test(`it can sideload a model with a has-many relationship containing embedded models`, function(assert) {
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

      let link = this.schema.wordSmiths.find(1);
      let result = registry.serialize(link);

      assert.deepEqual(result, {
        wordSmith: {
          id: "1",
          name: "Link",
          postIds: ["1", "2"]
        },
        blogPosts: [
          { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
          { id: "2", title: "Ipsum", comments: [] }
        ]
      });
    });

    test(`it can sideload a model with a belongs-to relationship containing embedded models`, function(assert) {
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

      let fineComment = this.schema.fineComments.find(1);
      let result = registry.serialize(fineComment);

      assert.deepEqual(result, {
        fineComment: { id: "1", text: "pwned", postId: "1" },
        blogPosts: [
          {
            id: "1",
            title: "Lorem",
            author: { id: "1", name: "Link" }
          }
        ]
      });
    });
  }
);
