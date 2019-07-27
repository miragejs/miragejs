import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Model, hasMany, JSONAPISerializer } from "@miragejs/server";
import { underscore } from "@lib/utils/inflector";

describe("Integration | Serializers | JSON API Serializer | Key for relationship", function() {
  beforeEach(function() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model
    });
  });

  test(`keyForRelationship works`, () => {
    let ApplicationSerializer = JSONAPISerializer.extend({
      keyForRelationship(key) {
        return underscore(key);
      }
    });
    let registry = new SerializerRegistry(this.schema, {
      application: ApplicationSerializer,
      wordSmith: ApplicationSerializer.extend({
        include: ["blogPosts"]
      })
    });
    let wordSmith = this.schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      lastName: "Jackson",
      age: 323
    });
    wordSmith.createBlogPost({ title: "Lorem ipsum" });

    let result = registry.serialize(wordSmith);

    assert.deepEqual(result, {
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          age: 323,
          "first-name": "Link",
          "last-name": "Jackson"
        },
        relationships: {
          blog_posts: {
            data: [{ id: "1", type: "blog-posts" }]
          }
        }
      },
      included: [
        {
          attributes: {
            title: "Lorem ipsum"
          },
          id: "1",
          type: "blog-posts"
        }
      ]
    });
  });
});
