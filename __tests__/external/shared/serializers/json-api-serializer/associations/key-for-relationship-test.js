import { Server, Model, hasMany, JSONAPISerializer } from "miragejs";
import snakeCase from "lodash/snakeCase.js";

describe("External | Shared | Serializers | JSON API Serializer | Key for relationship", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      models: {
        wordSmith: Model.extend({
          blogPosts: hasMany(),
        }),
        blogPost: Model,
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test(`keyForRelationship works`, () => {
    let ApplicationSerializer = JSONAPISerializer.extend({
      keyForRelationship(key) {
        return snakeCase(key);
      },
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
      firstName: "Link",
      lastName: "Jackson",
      age: 323,
    });
    wordSmith.createBlogPost({ title: "Lorem ipsum" });

    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          age: 323,
          "first-name": "Link",
          "last-name": "Jackson",
        },
        relationships: {
          blog_posts: {
            data: [{ id: "1", type: "blog-posts" }],
          },
        },
      },
      included: [
        {
          attributes: {
            title: "Lorem ipsum",
          },
          id: "1",
          type: "blog-posts",
        },
      ],
    });
  });
});
