import {
  _ormSchema as Schema,
  _Db as Db,
  Model,
  hasMany,
  JSONAPISerializer,
} from "@lib";

/*
  This test is heavily coupled to the implementation and can be deleted
  during a future refactoring.
*/
describe("Unit | Serializers | JSON API Serializer | #_createIncludesGraphSnapshot collections", function () {
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

  test("it works on collections with no includes", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({}),
    });
    schema.wordSmiths.create();
    schema.wordSmiths.create();

    serializer._createRequestedIncludesGraph(schema.wordSmiths.all());

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {},
        "word-smith:2": {},
      },
    });
  });

  test("it works on collections with hasMany relationships and dot-path includes", () => {
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
    let wordSmith1 = schema.wordSmiths.create();
    wordSmith1.createRedTag();
    wordSmith1.createRedTag();

    let bluePost = wordSmith1.createBluePost();
    let redTag = bluePost.createRedTag();
    redTag.createSomeColor();

    let wordSmith2 = schema.wordSmiths.create();
    wordSmith2.createRedTag();

    let bluePost2 = wordSmith2.createBluePost();
    let redTag2 = bluePost2.createRedTag();
    redTag2.createSomeColor();

    serializer.request = {
      queryParams: { include: "red-tags,blue-posts.red-tags.some-colors" },
    };

    serializer._createRequestedIncludesGraph(schema.wordSmiths.all());

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "red-tags": ["red-tag:1", "red-tag:2"],
            "blue-posts": ["blue-post:1"],
          },
        },
        "word-smith:2": {
          relationships: {
            "red-tags": ["red-tag:4"],
            "blue-posts": ["blue-post:2"],
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
          "red-tag:4": {},
          "red-tag:5": {
            relationships: {
              "some-colors": ["some-color:2"],
            },
          },
        },
        "blue-posts": {
          "blue-post:1": {
            relationships: {
              "red-tags": ["red-tag:3"],
            },
          },
          "blue-post:2": {
            relationships: {
              "red-tags": ["red-tag:5"],
            },
          },
        },
        "some-colors": {
          "some-color:1": {},
          "some-color:2": {},
        },
      },
    });
  });
});
