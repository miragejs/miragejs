import { Server, Model, hasMany, belongsTo, JSONAPISerializer } from "miragejs";

describe("External | Shared | Serializers | JSON API Serializer | Associations | Collection", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      models: {
        wordSmith: Model.extend({
          posts: hasMany("blogPost", { inverse: "author" }),
        }),
        blogPost: Model.extend({
          author: belongsTo("wordSmith", { inverse: "posts" }),
          comments: hasMany("fineComment", { inverse: "post" }),
        }),
        fineComment: Model.extend({
          post: belongsTo("blogPost"),
        }),
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test(`by default, it doesn't include a collection's relationships if those relationships are not included in the document and no links are defined`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });
    server.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    server.schema.wordSmiths.create({ firstName: "Zelda", age: 456 });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123,
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456,
          },
        },
      ],
    });
  });

  test(`when alwaysIncludeLinkageData is true, it contains linkage data for all a collection's relationships, regardless of includes`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer.extend({
          alwaysIncludeLinkageData: true,
        }),
      },
    });
    server.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    server.schema.wordSmiths.create({ firstName: "Zelda", age: 456 });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123,
          },
          relationships: {
            posts: {
              data: [],
            },
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456,
          },
          relationships: {
            posts: {
              data: [],
            },
          },
        },
      ],
    });
  });

  test(`when shouldIncludeLinkageData returns true for a relationship, it contains linkage data for that relationship on all of the collection, regardless of includes`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer.extend({
          shouldIncludeLinkageData(relationshipName, model) {
            if (relationshipName == "posts") {
              return true;
            }
          },
        }),
      },
    });
    server.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    server.schema.wordSmiths.create({ firstName: "Zelda", age: 456 });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123,
          },
          relationships: {
            posts: {
              data: [],
            },
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456,
          },
          relationships: {
            posts: {
              data: [],
            },
          },
        },
      ],
    });
  });

  test(`it includes linkage data for a has-many relationship that's being included`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          include: ["posts"],
        }),
      },
    });
    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    link.createPost({ title: "Lorem" });
    link.createPost({ title: "Ipsum" });
    server.schema.wordSmiths.create({ firstName: "Zelda" });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
          },
          relationships: {
            posts: {
              data: [
                { type: "blog-posts", id: "1" },
                { type: "blog-posts", id: "2" },
              ],
            },
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
          },
          relationships: {
            posts: {
              data: [],
            },
          },
        },
      ],
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum",
          },
        },
      ],
    });
  });

  test(`it can serialize a collection with a chain of has-many relationships`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          include: ["posts"],
        }),
        blogPost: JSONAPISerializer.extend({
          include: ["comments"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    let lorem = link.createPost({ title: "Lorem" });
    lorem.createComment({ text: "pwned" });
    link.createPost({ title: "Ipsum" });
    server.schema.wordSmiths.create({ firstName: "Zelda" });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
          },
          relationships: {
            posts: {
              data: [
                { type: "blog-posts", id: "1" },
                { type: "blog-posts", id: "2" },
              ],
            },
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
          },
          relationships: {
            posts: {
              data: [],
            },
          },
        },
      ],
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
          relationships: {
            comments: {
              data: [{ type: "fine-comments", id: "1" }],
            },
          },
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {
            text: "pwned",
          },
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum",
          },
          relationships: {
            comments: {
              data: [],
            },
          },
        },
      ],
    });
  });

  test(`it can serialize a collection with a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          include: ["author"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    let post = link.createPost({ title: "Lorem" });
    post.createComment();
    link.createPost({ title: "Ipsum" });
    server.schema.wordSmiths.create({ firstName: "Zelda" });

    let blogPosts = server.schema.blogPosts.all();
    let result = server.serializerOrRegistry.serialize(blogPosts);

    expect(result).toEqual({
      data: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" },
            },
          },
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum",
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" },
            },
          },
        },
      ],
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
          },
        },
      ],
    });
  });

  test(`it can serialize a collection with a chain of belongs-to relationships`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        fineComment: JSONAPISerializer.extend({
          include: ["post"],
        }),
        blogPost: JSONAPISerializer.extend({
          include: ["author"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    let post = link.createPost({ title: "Lorem" });
    post.createComment({ text: "pwned" });
    link.createPost({ title: "Ipsum" });
    server.schema.wordSmiths.create({ firstName: "Zelda" });

    let fineComments = server.schema.fineComments.all();
    let result = server.serializerOrRegistry.serialize(fineComments);

    expect(result).toEqual({
      data: [
        {
          type: "fine-comments",
          id: "1",
          attributes: {
            text: "pwned",
          },
          relationships: {
            post: {
              data: { type: "blog-posts", id: "1" },
            },
          },
        },
      ],
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" },
            },
          },
        },
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
          },
        },
      ],
    });
  });

  test(`it propertly serializes complex relationships`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          include: ["author", "comments"],
        }),
        wordSmith: JSONAPISerializer.extend({
          include: ["posts"],
        }),
        fineComment: JSONAPISerializer.extend({
          include: ["post"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    let post = link.createPost({ title: "Lorem" });
    post.createComment({ text: "pwned" });
    link.createPost({ title: "Ipsum" });
    server.schema.wordSmiths.create({ firstName: "Zelda" });

    let blogPost = server.schema.blogPosts.find(1);
    let result = server.serializerOrRegistry.serialize(blogPost);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem",
        },
        relationships: {
          author: {
            data: { type: "word-smiths", id: "1" },
          },
          comments: {
            data: [{ type: "fine-comments", id: "1" }],
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
          },
          relationships: {
            posts: {
              data: [
                {
                  id: "1",
                  type: "blog-posts",
                },
                {
                  id: "2",
                  type: "blog-posts",
                },
              ],
            },
          },
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Ipsum",
          },
          relationships: {
            author: {
              data: { type: "word-smiths", id: "1" },
            },
            comments: {
              data: [],
            },
          },
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {
            text: "pwned",
          },
          relationships: {
            post: {
              data: {
                id: "1",
                type: "blog-posts",
              },
            },
          },
        },
      ],
    });
  });
});
