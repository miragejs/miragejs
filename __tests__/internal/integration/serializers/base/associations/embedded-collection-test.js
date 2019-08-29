import { Model, hasMany, belongsTo } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Embedded Collections", function() {
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
    let blogPost = wordSmith.createPost({ title: "Lorem" });
    blogPost.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    schema.wordSmiths.create({ name: "Zelda" });

    BaseSerializer = Serializer.extend({
      embed: true
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can embed a collection with a has-many relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["posts"]
      })
    });

    let wordSmiths = schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [
        {
          id: "1",
          name: "Link",
          posts: [{ id: "1", title: "Lorem" }, { id: "2", title: "Ipsum" }]
        },
        {
          id: "2",
          name: "Zelda",
          posts: []
        }
      ]
    });
  });

  test(`it can embed a collection with a chain of has-many relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
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
        {
          id: "1",
          name: "Link",
          posts: [
            {
              id: "1",
              title: "Lorem",
              comments: [{ id: "1", text: "pwned" }]
            },
            {
              id: "2",
              title: "Ipsum",
              comments: []
            }
          ]
        },
        {
          id: "2",
          name: "Zelda",
          posts: []
        }
      ]
    });
  });

  test(`it can embed a collection with a belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      blogPost: BaseSerializer.extend({
        include: ["author"]
      })
    });

    let blogPosts = schema.blogPosts.all();
    let result = registry.serialize(blogPosts);

    expect(result).toEqual({
      blogPosts: [
        {
          id: "1",
          title: "Lorem",
          author: { id: "1", name: "Link" }
        },
        {
          id: "2",
          title: "Ipsum",
          author: { id: "1", name: "Link" }
        }
      ]
    });
  });

  test(`it can embed a collection with a chain of belongs-to relationships`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      fineComment: BaseSerializer.extend({
        include: ["post"]
      }),
      blogPost: BaseSerializer.extend({
        include: ["author"]
      })
    });

    let fineComments = schema.fineComments.all();
    let result = registry.serialize(fineComments);

    expect(result).toEqual({
      fineComments: [
        {
          id: "1",
          text: "pwned",
          post: {
            id: "1",
            title: "Lorem",
            author: { id: "1", name: "Link" }
          }
        }
      ]
    });
  });
});
