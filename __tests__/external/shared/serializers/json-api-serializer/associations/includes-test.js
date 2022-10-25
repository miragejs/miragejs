import { Server, JSONAPISerializer, Model, hasMany, belongsTo } from "miragejs";

describe("External | Shared | Serializers | JSON API Serializer | Associations | Includes", () => {
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
          category: belongsTo(),
        }),

        category: Model.extend({
          labels: hasMany(),
        }),

        label: Model.extend({}),
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("includes get serialized with correct serializer", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          attrs: ["title"],
          include: ["wordSmith"],
        }),
        wordSmith: JSONAPISerializer.extend({
          attrs: ["firstName"],
        }),
      },
    });

    let post = server.schema.blogPosts.create({ title: "We love Mirage!" });
    post.createWordSmith({ firstName: "Sam" });

    let result = server.serializerOrRegistry.serialize(post);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "We love Mirage!",
        },
        relationships: {
          "word-smith": {
            data: { type: "word-smiths", id: "1" },
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Sam",
          },
        },
      ],
    });
  });

  test("includes can be a function", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          attrs: ["title"],
          include() {
            return ["wordSmith"];
          },
        }),
        wordSmith: JSONAPISerializer.extend({
          attrs: ["firstName"],
        }),
      },
    });

    let post = server.schema.blogPosts.create({ title: "We love Mirage!" });
    post.createWordSmith({ firstName: "Sam" });

    let result = server.serializerOrRegistry.serialize(post);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {
          title: "We love Mirage!",
        },
        relationships: {
          "word-smith": {
            data: { type: "word-smiths", id: "1" },
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Sam",
          },
        },
      ],
    });
  });

  test("query param includes work when serializing a model", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    let post = server.schema.blogPosts.create();
    post.createWordSmith();
    post.createFineComment();
    post.createFineComment();

    let request = {
      queryParams: {
        include: "word-smith,fine-comments",
      },
    };

    let result = server.serializerOrRegistry.serialize(post, request);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {},
        relationships: {
          "word-smith": {
            data: { type: "word-smiths", id: "1" },
          },
          "fine-comments": {
            data: [
              { type: "fine-comments", id: "1" },
              { type: "fine-comments", id: "2" },
            ],
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "2",
          attributes: {},
        },
      ],
    });
  });

  test("query param array includes work when serializing a model", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    let post = server.schema.blogPosts.create();
    post.createWordSmith();
    post.createFineComment();
    post.createFineComment();

    let request = {
      queryParams: {
        include: ["word-smith", "fine-comments"],
      },
    };

    let result = server.serializerOrRegistry.serialize(post, request);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {},
        relationships: {
          "word-smith": {
            data: { type: "word-smiths", id: "1" },
          },
          "fine-comments": {
            data: [
              { type: "fine-comments", id: "1" },
              { type: "fine-comments", id: "2" },
            ],
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "2",
          attributes: {},
        },
      ],
    });
  });

  test("query param includes work when serializing a collection", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    let post1 = server.schema.blogPosts.create();
    post1.createWordSmith();
    post1.createFineComment();
    post1.createFineComment();
    server.schema.blogPosts.create();

    let request = {
      queryParams: {
        include: "word-smith,fine-comments",
      },
    };

    let result = server.serializerOrRegistry.serialize(
      server.schema.blogPosts.all(),
      request
    );

    expect(result).toEqual({
      data: [
        {
          type: "blog-posts",
          id: "1",
          attributes: {},
          relationships: {
            "word-smith": {
              data: { type: "word-smiths", id: "1" },
            },
            "fine-comments": {
              data: [
                { type: "fine-comments", id: "1" },
                { type: "fine-comments", id: "2" },
              ],
            },
          },
        },
        {
          type: "blog-posts",
          id: "2",
          attributes: {},
          relationships: {
            "word-smith": {
              data: null,
            },
            "fine-comments": {
              data: [],
            },
          },
        },
      ],
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "2",
          attributes: {},
        },
      ],
    });
  });

  test("query param includes take precedence over default server includes", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        blogPost: JSONAPISerializer.extend({
          include: ["wordSmith"],
        }),
      },
    });

    let post = server.schema.blogPosts.create();
    post.createWordSmith();
    post.createFineComment();
    post.createFineComment();

    let request = {
      queryParams: {
        include: "fine-comments",
      },
    };

    let result = server.serializerOrRegistry.serialize(post, request);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {},
        relationships: {
          "fine-comments": {
            data: [
              { type: "fine-comments", id: "1" },
              { type: "fine-comments", id: "2" },
            ],
          },
        },
      },
      included: [
        {
          type: "fine-comments",
          id: "1",
          attributes: {},
        },
        {
          type: "fine-comments",
          id: "2",
          attributes: {},
        },
      ],
    });
  });

  test("query param includes support dot-paths when serializing a model", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    server.schema.db.loadData({
      wordSmiths: [{ id: 1, name: "Sam", blogPostIds: [2] }],
      blogPosts: [
        { id: 2, wordSmithId: 1, fineCommentIds: [3], title: "Lorem Ipsum" },
      ],
      fineComments: [{ id: 3, text: "Foo", blogPostId: 2, categoryId: 10 }],
      categories: [{ id: 10, foo: "bar", labelIds: [20] }],
      labels: [{ id: 20, name: "Economics" }],
    });
    let request = {
      queryParams: {
        include: "word-smith,fine-comments.category.labels",
      },
    };
    let result = server.serializerOrRegistry.serialize(
      server.schema.blogPosts.first(),
      request
    );

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "2",
        attributes: {
          title: "Lorem Ipsum",
        },
        relationships: {
          "word-smith": {
            data: { type: "word-smiths", id: "1" },
          },
          "fine-comments": {
            data: [{ type: "fine-comments", id: "3" }],
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            name: "Sam",
          },
        },
        {
          type: "fine-comments",
          id: "3",
          attributes: {
            text: "Foo",
          },
          relationships: {
            category: {
              data: { type: "categories", id: "10" },
            },
          },
        },
        {
          type: "categories",
          id: "10",
          attributes: {
            foo: "bar",
          },
          relationships: {
            labels: {
              data: [{ type: "labels", id: "20" }],
            },
          },
        },
        {
          type: "labels",
          id: "20",
          attributes: {
            name: "Economics",
          },
        },
      ],
    });
  });

  test("query param includes support dot-paths when serializing a collection", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    server.schema.db.loadData({
      wordSmiths: [{ id: 1, name: "Sam", blogPostIds: [2, 5] }],
      blogPosts: [
        { id: 2, wordSmithId: 1, fineCommentIds: [3], title: "Lorem Ipsum" },
        { id: 5, wordSmithId: 1, title: "Dolor" },
      ],
      fineComments: [{ id: 3, text: "Foo", blogPostId: 2, categoryId: 10 }],
      categories: [{ id: 10, foo: "bar", labelIds: [20] }],
      labels: [{ id: 20, name: "Economics" }],
    });
    let request = {
      queryParams: {
        include: "word-smith,fine-comments.category.labels",
      },
    };
    let result = server.serializerOrRegistry.serialize(
      server.schema.blogPosts.all(),
      request
    );

    expect(result).toEqual({
      data: [
        {
          type: "blog-posts",
          id: "2",
          attributes: {
            title: "Lorem Ipsum",
          },
          relationships: {
            "word-smith": {
              data: { type: "word-smiths", id: "1" },
            },
            "fine-comments": {
              data: [{ type: "fine-comments", id: "3" }],
            },
          },
        },
        {
          type: "blog-posts",
          id: "5",
          attributes: {
            title: "Dolor",
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
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            name: "Sam",
          },
        },
        {
          type: "fine-comments",
          id: "3",
          attributes: {
            text: "Foo",
          },
          relationships: {
            category: {
              data: { type: "categories", id: "10" },
            },
          },
        },
        {
          type: "categories",
          id: "10",
          attributes: {
            foo: "bar",
          },
          relationships: {
            labels: {
              data: [{ type: "labels", id: "20" }],
            },
          },
        },
        {
          type: "labels",
          id: "20",
          attributes: {
            name: "Economics",
          },
        },
      ],
    });
  });

  test("queryParamIncludes throws if including something that is not an association", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    server.schema.db.loadData({
      blogPosts: [{ id: 2, title: "Lorem Ipsum" }],
    });
    let request = {
      queryParams: {
        include: "title",
      },
    };

    expect(() => {
      server.serializerOrRegistry.serialize(
        server.schema.blogPosts.first(),
        request
      );
    }).toThrow();
  });

  test("Do not return includes when queryParamIncludes is empty", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    let post = server.schema.blogPosts.create();

    let request = {
      queryParams: {
        include: " ",
      },
    };

    let result = server.serializerOrRegistry.serialize(post, request);

    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {},
      },
    });
  });

  test("Do not throw when queryParamIncludes has a trailing comma", () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
      },
    });

    let post = server.schema.blogPosts.create();
    post.createWordSmith({ name: "Sam" });

    let request = {
      queryParams: {
        include: "word-smith,",
      },
    };

    let result = server.serializerOrRegistry.serialize(post, request);
    expect(result).toEqual({
      data: {
        type: "blog-posts",
        id: "1",
        attributes: {},
        relationships: {
          "word-smith": {
            data: { type: "word-smiths", id: "1" },
          },
        },
      },
      included: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            name: "Sam",
          },
        },
      ],
    });
  });
});
