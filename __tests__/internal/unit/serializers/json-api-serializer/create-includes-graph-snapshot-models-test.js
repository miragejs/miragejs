import {
  _ormSchema as Schema,
  _Db as Db,
  Model,
  hasMany,
  belongsTo,
  JSONAPISerializer,
} from "@lib";

/*
  This test is heavily coupled to the implementation and can be deleted
  during a future refactoring.
*/
describe("Unit | Serializers | JSON API Serializer | #_createIncludesGraphSnapshot models", function () {
  let serializer = null;
  let registry = null;
  let type = null;
  let request = {};

  beforeEach(function () {
    registry = {
      serializerFor() {
        return serializer;
      },
    };
    type = "foo";
    request = {};

    serializer = new JSONAPISerializer(registry, type, request);
  });

  test("it works on models with no includes", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({}),
    });
    let wordSmith = schema.wordSmiths.create();

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {},
      },
    });
  });

  test("it doesn't choke on an empty belongsTo relationship", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPost: belongsTo(),
      }),
      blogPost: Model.extend({
        happyCategory: belongsTo(),
      }),
      happyCategory: Model.extend(),
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createBlogPost();

    serializer.request = {
      queryParams: { include: "blog-post.happy-category" },
    };

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "blog-post": "blog-post:1",
          },
        },
      },
      included: {
        "blog-posts": {
          "blog-post:1": {
            relationships: {
              "happy-category": undefined,
            },
          },
        },
      },
    });
  });

  test("it works on models with belongsTo relationships", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTag: belongsTo(),
        bluePost: belongsTo(),
      }),
      bluePost: Model.extend({
        redTag: belongsTo(),
      }),
      redTag: Model.extend(),
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    bluePost.createRedTag();

    serializer.request = { queryParams: { include: "red-tag,blue-post" } };

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "red-tag": "red-tag:1",
            "blue-post": "blue-post:1",
          },
        },
      },
      included: {
        "red-tags": {
          "red-tag:1": {},
        },
        "blue-posts": {
          "blue-post:1": {},
        },
      },
    });
  });

  test("it works on models with belongsTo relationships and dot-path includes", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTag: belongsTo(),
        bluePost: belongsTo(),
      }),
      bluePost: Model.extend({
        redTag: belongsTo(),
      }),
      redTag: Model.extend({
        someColor: belongsTo(),
      }),
      someColor: Model.extend({}),
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    let redTag = bluePost.createRedTag();
    redTag.createSomeColor();

    serializer.request = {
      queryParams: { include: "red-tag,blue-post.red-tag.some-color" },
    };

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "red-tag": "red-tag:1",
            "blue-post": "blue-post:1",
          },
        },
      },
      included: {
        "red-tags": {
          "red-tag:1": {},
          "red-tag:2": {
            relationships: {
              "some-color": "some-color:1",
            },
          },
        },
        "blue-posts": {
          "blue-post:1": {
            relationships: {
              "red-tag": "red-tag:2",
            },
          },
        },
        "some-colors": {
          "some-color:1": {},
        },
      },
    });
  });

  test("it works on models with hasMany relationships", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTags: hasMany(),
        bluePosts: hasMany(),
      }),
      bluePost: Model.extend({
        redTags: hasMany(),
      }),
      redTag: Model.extend(),
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    bluePost.createRedTag();

    serializer.request = { queryParams: { include: "red-tags,blue-posts" } };

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "red-tags": ["red-tag:1", "red-tag:2"],
            "blue-posts": ["blue-post:1"],
          },
        },
      },
      included: {
        "red-tags": {
          "red-tag:1": {},
          "red-tag:2": {},
        },
        "blue-posts": {
          "blue-post:1": {},
        },
      },
    });
  });

  test("it works on models with hasMany relationships and dot-path includes", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        redTags: hasMany(),
        bluePosts: hasMany(),
      }),
      bluePost: Model.extend({
        redTags: hasMany(),
      }),
      redTag: Model.extend({
        someColors: hasMany(),
      }),
      someColor: Model.extend(),
    });
    let wordSmith = schema.wordSmiths.create();
    wordSmith.createRedTag();
    wordSmith.createRedTag();

    let bluePost = wordSmith.createBluePost();
    let redTag = bluePost.createRedTag();
    redTag.createSomeColor();

    serializer.request = {
      queryParams: { include: "red-tags,blue-posts.red-tags.some-colors" },
    };

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "red-tags": ["red-tag:1", "red-tag:2"],
            "blue-posts": ["blue-post:1"],
          },
        },
      },
      included: {
        "red-tags": {
          "red-tag:1": {},
          "red-tag:2": {},
          "red-tag:3": {
            relationships: {
              "some-colors": ["some-color:1"],
            },
          },
        },
        "blue-posts": {
          "blue-post:1": {
            relationships: {
              "red-tags": ["red-tag:3"],
            },
          },
        },
        "some-colors": {
          "some-color:1": {},
        },
      },
    });
  });
});
