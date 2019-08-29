import { Model, hasMany, belongsTo } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Sideloading Models", function() {
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

  test(`it throws an error if embed is false and root is false`, () => {
    let registry = new SerializerRegistry(schema, {
      wordSmith: BaseSerializer.extend({
        root: false,
        include: ["posts"]
      })
    });

    let link = schema.wordSmiths.find(1);
    expect(function() {
      registry.serialize(link);
    }).toThrow();
  });

  test(`it can sideload a model with a has-many relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
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
      blogPosts: [{ id: "1", title: "Lorem" }, { id: "2", title: "Ipsum" }]
    });
  });

  test(`it can sideload a model with a chain of has-many relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
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
        { id: "1", title: "Lorem", commentIds: ["1"] },
        { id: "2", title: "Ipsum", commentIds: [] }
      ],
      fineComments: [{ id: "1", text: "pwned" }]
    });
  });

  test(`it avoids circularity when serializing a model`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author"]
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
        { id: "1", title: "Lorem", authorId: "1" },
        { id: "2", title: "Ipsum", authorId: "1" }
      ]
    });
  });

  test(`it can sideload a model with a belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      blogPost: BaseSerializer.extend({
        include: ["author"]
      })
    });

    let blogPost = schema.blogPosts.find(1);
    let result = registry.serialize(blogPost);

    expect(result).toEqual({
      blogPost: {
        id: "1",
        title: "Lorem",
        authorId: "1"
      },
      wordSmiths: [{ id: "1", name: "Link" }]
    });
  });

  test(`it can sideload a model with a chain of belongs-to relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      fineComment: BaseSerializer.extend({
        include: ["post"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author"]
      })
    });

    let fineComment = schema.fineComments.find(1);
    let result = registry.serialize(fineComment);

    expect(result).toEqual({
      fineComment: {
        id: "1",
        text: "pwned",
        postId: "1"
      },
      blogPosts: [{ id: "1", title: "Lorem", authorId: "1" }],
      wordSmiths: [{ id: "1", name: "Link" }]
    });
  });
});
