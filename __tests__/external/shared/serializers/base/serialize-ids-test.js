import { Server, Serializer, Model, hasMany } from "miragejs";

describe("External | Shared | Serializers | Base | Serialize ids", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model.extend({
          blogPosts: hasMany(),
          specialPosts: hasMany("blog-post", { inverse: "specialAuthor" }),
        }),
        blogPost: Model,
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`if serializeIds is 'include' it serializes ids of hasMany associations that are included`, () => {
    let ApplicationSerializer = Serializer.extend({
      serializeIds: "included",
    });
    server.config({
      serializers: {
        application: ApplicationSerializer,
        wordSmith: ApplicationSerializer.extend({
          include: ["blogPosts"],
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      name: "Link",
    });
    wordSmith.createBlogPost();
    wordSmith.createBlogPost();
    wordSmith.createSpecialPost();
    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        blogPostIds: ["1", "2"],
      },
      blogPosts: [{ id: "1" }, { id: "2" }],
    });
  });

  test(`if serializeIds is 'always' it serializes ids of all hasMany associations`, () => {
    server.config({
      serializers: {
        application: Serializer.extend({
          serializeIds: "always",
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      name: "Link",
    });
    wordSmith.createBlogPost();
    wordSmith.createBlogPost();
    wordSmith.createSpecialPost();
    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        blogPostIds: ["1", "2"],
        specialPostIds: ["3"],
      },
    });
  });
});
