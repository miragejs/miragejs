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
describe("Unit | Serializers | JSON API Serializer | #_createIncludesGraphSnapshot mixed", function () {
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

  test("it works on models and collections with dot-path includes", () => {
    let schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany(),
      }),
      blogPost: Model.extend({
        happyTag: belongsTo(),
      }),
      happyTag: Model.extend({
        happyColor: belongsTo(),
      }),
      happyColor: Model.extend(),
    });
    let wordSmith = schema.wordSmiths.create();
    let blogPost1 = wordSmith.createBlogPost();
    let happyTag = blogPost1.createHappyTag();
    happyTag.createHappyColor();

    let blogPost2 = wordSmith.createBlogPost();
    let happyTag2 = blogPost2.createHappyTag();
    happyTag2.createHappyColor();

    serializer.request = {
      queryParams: { include: "blog-posts.happy-tag.happy-color" },
    };

    serializer._createRequestedIncludesGraph(wordSmith);

    expect(serializer.request._includesGraph).toEqual({
      data: {
        "word-smith:1": {
          relationships: {
            "blog-posts": ["blog-post:1", "blog-post:2"],
          },
        },
      },
      included: {
        "blog-posts": {
          "blog-post:1": {
            relationships: {
              "happy-tag": "happy-tag:1",
            },
          },
          "blog-post:2": {
            relationships: {
              "happy-tag": "happy-tag:2",
            },
          },
        },
        "happy-tags": {
          "happy-tag:1": {
            relationships: {
              "happy-color": "happy-color:1",
            },
          },
          "happy-tag:2": {
            relationships: {
              "happy-color": "happy-color:2",
            },
          },
        },
        "happy-colors": {
          "happy-color:1": {},
          "happy-color:2": {},
        },
      },
    });
  });
});
