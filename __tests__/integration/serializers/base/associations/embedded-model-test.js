import { Model, hasMany, belongsTo } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Embedded Models", function() {
  let schema, BaseSerializer;

  beforeEach(function() {
    schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        posts: hasMany("blogPost", { inverse: "author" })
      }),
      blogPost: Model.extend({
        author: belongsTo("wordSmith", { inverse: "posts" }),
        comments: hasMany("fineComment", { inverse: "post" })
      }),
      fineComment: Model.extend({
        post: belongsTo("blogPost")
      })
    });

    let wordSmith = schema.wordSmiths.create({ name: "Link" });
    let post = wordSmith.createPost({ title: "Lorem" });
    post.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    schema.wordSmiths.create({ name: "Zelda" });

    BaseSerializer = Serializer.extend({
      embed: true
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can embed has-many relationships`, () => {
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
        posts: [{ id: "1", title: "Lorem" }, { id: "2", title: "Ipsum" }]
      }
    });
  });

  test(`it can embed a chain of has-many relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["comments"]
      })
    });

    let wordSmith = schema.wordSmiths.find(1);
    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        posts: [
          { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
          { id: "2", title: "Ipsum", comments: [] }
        ]
      }
    });
  });

  test(`it can embed a belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      blogPost: BaseSerializer.extend({
        embed: true,
        include: ["author"]
      })
    });

    let blogPost = schema.blogPosts.find(1);
    let result = registry.serialize(blogPost);

    expect(result).toEqual({
      blogPost: {
        id: "1",
        title: "Lorem",
        author: { id: "1", name: "Link" }
      }
    });
  });

  test(`it can serialize a chain of belongs-to relationships`, () => {
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
        post: {
          id: "1",
          title: "Lorem",
          author: {
            id: "1",
            name: "Link"
          }
        }
      }
    });
  });

  test(`it can have a null value on a belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      blogPost: BaseSerializer.extend({
        embed: true,
        include: ["author"]
      })
    });

    let blogPost = schema.blogPosts.find(1);
    blogPost.update("author", null);
    let result = registry.serialize(blogPost);

    expect(result).toEqual({
      blogPost: {
        id: "1",
        title: "Lorem"
      }
    });
  });

  test(`it ignores relationships that refer to serialized ancestor resources`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author"]
      })
    });

    let wordSmith = schema.wordSmiths.find(1);
    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        posts: [{ id: "1", title: "Lorem" }, { id: "2", title: "Ipsum" }]
      }
    });
  });

  test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        embed: true,
        include: ["posts"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author", "comments"]
      }),
      fineComment: BaseSerializer.extend({
        include: ["post"]
      })
    });

    let wordSmith = schema.wordSmiths.find(1);
    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        posts: [
          { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
          { id: "2", title: "Ipsum", comments: [] }
        ]
      }
    });
  });
});
