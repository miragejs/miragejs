import Schema from "@lib/orm/schema";
import { Model, hasMany, belongsTo } from "@miragejs/server";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Sideloading and Embedded Models", function() {
  let schema, BaseSerializer;

  beforeEach(function() {
    schema = new Schema(new Db(), {
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

    let wordSmith = schema.wordSmiths.create({ name: "Link" });
    let blogPost = wordSmith.createPost({ title: "Lorem" });
    blogPost.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    schema.wordSmiths.create({ name: "Zelda" });

    BaseSerializer = Serializer.extend({
      embed: false
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can sideload a model with a has-many relationship containing embedded models`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        embed: false,
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
        embed: true,
        include: ["comments"]
      })
    });

    let link = schema.wordSmiths.find(1);
    let result = registry.serialize(link);

    expect(result).toEqual({
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

  test(`it can sideload a model with a belongs-to relationship containing embedded models`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      fineComment: BaseSerializer.extend({
        embed: false,
        include: ["post"]
      }),
      blogPost: BaseSerializer.extend({
        embed: true,
        include: ["author"]
      })
    });

    let fineComment = schema.fineComments.find(1);
    let result = registry.serialize(fineComment);

    expect(result).toEqual({
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
});
