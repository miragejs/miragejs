import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Serializer, Model, hasMany } from "@miragejs/server";

describe("Integration | Serializers | Base | Serialize ids", function() {
  let schema;

  beforeEach(function() {
    schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany(),
        specialPosts: hasMany("blog-post", { inverse: "specialAuthor" })
      }),
      blogPost: Model
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`if serializeIds is 'include' it serializes ids of hasMany associations that are included`, () => {
    let ApplicationSerializer = Serializer.extend({
      serializeIds: "included"
    });
    let registry = new SerializerRegistry(schema, {
      application: ApplicationSerializer,
      wordSmith: ApplicationSerializer.extend({
        include: ["blogPosts"]
      })
    });

    let wordSmith = schema.wordSmiths.create({
      id: 1,
      name: "Link"
    });
    wordSmith.createBlogPost();
    wordSmith.createBlogPost();
    wordSmith.createSpecialPost();
    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        blogPostIds: ["1", "2"]
      },
      blogPosts: [{ id: "1" }, { id: "2" }]
    });
  });

  test(`if serializeIds is 'always' it serializes ids of all hasMany associations`, () => {
    let registry = new SerializerRegistry(schema, {
      application: Serializer.extend({
        serializeIds: "always"
      })
    });

    let wordSmith = schema.wordSmiths.create({
      id: 1,
      name: "Link"
    });
    wordSmith.createBlogPost();
    wordSmith.createBlogPost();
    wordSmith.createSpecialPost();
    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        blogPostIds: ["1", "2"],
        specialPostIds: ["3"]
      }
    });
  });
});
