import { Model, hasMany, belongsTo } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Sideloading Collections", function() {
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

  test(`it throws an error if embed is false and root is false`, () => {
    let registry = new SerializerRegistry(schema, {
      wordSmith: BaseSerializer.extend({
        root: false,
        include: ["posts"]
      })
    });

    let wordSmiths = schema.wordSmiths.all();

    expect(function() {
      registry.serialize(wordSmiths);
    }).toThrow();
  });

  test(`it can sideload an empty collection`, () => {
    schema.db.emptyData();
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
      })
    });

    let result = registry.serialize(schema.wordSmiths.all());

    expect(result).toEqual({
      wordSmiths: []
    });
  });

  test(`it can sideload a collection with a has-many relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        embed: false,
        include: ["posts"]
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
        { id: "1", title: "Lorem" },
        { id: "2", title: "Ipsum" },
        { id: "3", title: "Zeldas blogPost" }
      ]
    });
  });

  test(`it can sideload a collection with a chain of has-many relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        embed: false,
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
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
        { id: "1", title: "Lorem", commentIds: ["1"] },
        { id: "2", title: "Ipsum", commentIds: [] },
        { id: "3", title: "Zeldas blogPost", commentIds: [] }
      ],
      fineComments: [{ id: "1", text: "pwned" }]
    });
  });

  test(`it avoids circularity when serializing a collection`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        embed: false,
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author"]
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
        { id: "1", title: "Lorem", authorId: "1" },
        { id: "2", title: "Ipsum", authorId: "1" },
        { id: "3", title: "Zeldas blogPost", authorId: "2" }
      ]
    });
  });

  test(`it can sideload a collection with a belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      blogPost: BaseSerializer.extend({
        embed: false,
        include: ["author"]
      })
    });

    let blogPosts = schema.blogPosts.all();
    let result = registry.serialize(blogPosts);

    expect(result).toEqual({
      blogPosts: [
        { id: "1", title: "Lorem", authorId: "1" },
        { id: "2", title: "Ipsum", authorId: "1" },
        { id: "3", title: "Zeldas blogPost", authorId: "2" }
      ],
      wordSmiths: [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }]
    });
  });

  test(`it can sideload a collection with a chain of belongs-to relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      fineComment: BaseSerializer.extend({
        embed: false,
        include: ["post"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author"]
      })
    });

    let fineComments = schema.fineComments.all();
    let result = registry.serialize(fineComments);

    expect(result).toEqual({
      fineComments: [{ id: "1", text: "pwned", postId: "1" }],
      blogPosts: [{ id: "1", title: "Lorem", authorId: "1" }],
      wordSmiths: [{ id: "1", name: "Link" }]
    });
  });
});
