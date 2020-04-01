import { Server, Model, hasMany, belongsTo, JSONAPISerializer } from "miragejs";

describe("External | Shared | Serializers | JSON API Serializer | Associations | Model", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      models: {
        wordSmith: Model.extend({
          blogPosts: hasMany(),
        }),
        blogPost: Model.extend({
          wordSmith: belongsTo(),
          fineComments: hasMany(),
        }),
        fineComment: Model.extend({
          blogPost: belongsTo(),
        }),
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test(`by default, it doesn't include a model's relationships if those relationships are not included in the document and no links are defined`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });
    let link = server.schema.wordSmiths.create({
      firstName: "Link",
      age: 123,
    });
    let post = link.createBlogPost({ title: "Lorem ipsum" });

    let result = server.serializerOrRegistry.serialize(post);
    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem ipsum",
        },
      },
    });
  });

  test(`when alwaysIncludeLinkageData is true, it contains linkage data for all a model's relationships, regardless of includes`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer.extend({
          alwaysIncludeLinkageData: true,
        }),
      },
    });
    let link = server.schema.wordSmiths.create({
      firstName: "Link",
      age: 123,
    });
    let post = link.createBlogPost({ title: "Lorem ipsum" });

    let result = server.serializerOrRegistry.serialize(post);
    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem ipsum",
        },
        relationships: {
          "word-smith": {
            data: {
              type: "word-smiths",
              id: "1",
            },
          },
          "fine-comments": {
            data: [],
          },
        },
      },
    });
  });

  test(`when shouldIncludeLinkageData returns true for a certain belongsTo relationship, it contains linkage data for that relationship, regardless of includes`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer.extend({
          shouldIncludeLinkageData(relationshipName, model) {
            if (relationshipName === "wordSmith") {
              return true;
            }
          },
        }),
      },
    });
    let link = server.schema.wordSmiths.create({
      firstName: "Link",
      age: 123,
    });
    let post = link.createBlogPost({ title: "Lorem ipsum" });

    let result = server.serializerOrRegistry.serialize(post);
    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem ipsum",
        },
        relationships: {
          "word-smith": {
            data: {
              type: "word-smiths",
              id: "1",
            },
          },
        },
      },
    });
  });

  test(`when shouldIncludeLinkageData returns true for a certain hasMany relationship, it contains linkage data for that relationship, regardless of includes`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          shouldIncludeLinkageData(relationshipName, model) {
            if (relationshipName === "blogPosts") {
              return true;
            }
          },
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    link.createBlogPost({ title: "Lorem" });
    link.createBlogPost({ title: "Ipsum" });

    let result = server.serializerOrRegistry.serialize(link);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
        },
        relationships: {
          "blog-posts": {
            data: [
              { type: "blog-posts", id: "1" },
              { type: "blog-posts", id: "2" },
            ],
          },
        },
      },
    });
  });

  test(`it includes linkage data for a has-many relationship that's being included`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          include: ["blogPosts"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    link.createBlogPost({ title: "Lorem" });
    link.createBlogPost({ title: "Ipsum" });

    let result = server.serializerOrRegistry.serialize(link);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
        },
        relationships: {
          "blog-posts": {
            data: [
              { type: "blog-posts", id: "1" },
              { type: "blog-posts", id: "2" },
            ],
          },
        },
      },
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

  test(`it can include a chain of has-many relationships`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          include: ["blogPosts"],
        }),
        blogPost: JSONAPISerializer.extend({
          include: ["fineComments"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    let post1 = link.createBlogPost({ title: "Lorem" });
    post1.createFineComment({ text: "pwned" });
    link.createBlogPost({ title: "Ipsum" });

    let result = server.serializerOrRegistry.serialize(link);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
        },
        relationships: {
          "blog-posts": {
            data: [
              { type: "blog-posts", id: "1" },
              { type: "blog-posts", id: "2" },
            ],
          },
        },
      },
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
          relationships: {
            "fine-comments": {
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
            "fine-comments": {
              data: [],
            },
          },
        },
      ],
    });
  });

  test(`it can include a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          include: ["wordSmith"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({ firstName: "Link" });
    let blogPost = link.createBlogPost({ title: "Lorem" });
    blogPost.createFineComment();

    let result = server.serializerOrRegistry.serialize(blogPost);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem",
        },
        relationships: {
          "word-smith": {
            data: {
              id: "1",
              type: "word-smiths",
            },
          },
        },
      },
      included: [
        {
          attributes: {
            "first-name": "Link",
          },
          id: "1",
          type: "word-smiths",
        },
      ],
    });
  });

  test(`it gracefully handles null belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          include: ["wordSmith"],
        }),
      },
    });

    let blogPost = server.schema.blogPosts.create({ title: "Lorem" });
    let result = server.serializerOrRegistry.serialize(blogPost);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "Lorem",
        },
        relationships: {
          "word-smith": {
            data: null,
          },
        },
      },
    });
  });

  test(`it can include a chain of belongs-to relationships`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          include: ["wordSmith"],
        }),
        fineComment: JSONAPISerializer.extend({
          include: ["blogPost"],
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({ firstName: "Link" });
    let post = wordSmith.createBlogPost({ title: "Lorem" });
    let comment = post.createFineComment({ text: "pwned" });

    let result = server.serializerOrRegistry.serialize(comment);

    expect(result).toEqual({
      data: {
        type: "fine-comments",
        id: "1",
        attributes: {
          text: "pwned",
        },
        relationships: {
          "blog-post": {
            data: {
              id: "1",
              type: "blog-posts",
            },
          },
        },
      },
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
          relationships: {
            "word-smith": {
              data: {
                type: "word-smiths",
                id: "1",
              },
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

  test(`it properly serializes complex relationships`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          include: ["blogPosts"],
        }),
        blogPost: JSONAPISerializer.extend({
          include: ["wordSmith", "fineComments"],
        }),
        fineComment: JSONAPISerializer.extend({
          include: ["blogPost"],
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({ firstName: "Link" });
    let post = wordSmith.createBlogPost({ title: "Lorem" });
    wordSmith.createBlogPost({ title: "Ipsum" });
    post.createFineComment({ text: "pwned" });

    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      data: {
        attributes: {
          "first-name": "Link",
        },
        id: "1",
        relationships: {
          "blog-posts": {
            data: [
              { type: "blog-posts", id: "1" },
              { type: "blog-posts", id: "2" },
            ],
          },
        },
        type: "word-smiths",
      },
      included: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {
            title: "Lorem",
          },
          relationships: {
            "word-smith": {
              data: { type: "word-smiths", id: "1" },
            },
            "fine-comments": {
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
          relationships: {
            "blog-post": {
              data: { type: "blog-posts", id: "1" },
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
            "word-smith": {
              data: { type: "word-smiths", id: "1" },
            },
            "fine-comments": {
              data: [],
            },
          },
        },
      ],
    });
  });
});
