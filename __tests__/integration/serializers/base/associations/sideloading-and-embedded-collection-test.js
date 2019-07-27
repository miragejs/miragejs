import Schema from "@lib/orm/schema";
import { Model, hasMany, belongsTo } from "@miragejs/server";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Sideloading and Embedded Collections", function() {
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

    let link = schema.wordSmiths.create({ name: "Link" });
    let blogPost = link.createPost({ title: "Lorem" });
    link.createPost({ title: "Ipsum" });

    blogPost.createComment({ text: "pwned" });

    let zelda = schema.wordSmiths.create({ name: "Zelda" });
    zelda.createPost({ title: `Zeldas blogPost` });

    BaseSerializer = Serializer.extend({
      embed: false
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can sideload a collection with a has-many relationship containing embedded models`, () => {
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

    let wordSmiths = schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
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

  test(`it can sideload a collection with a belongs-to relationship containing embedded models`, () => {
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

    let fineComments = schema.fineComments.all();
    let result = registry.serialize(fineComments);

    expect(result).toEqual({
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
