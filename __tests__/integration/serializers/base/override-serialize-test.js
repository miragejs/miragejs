import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";
import schemaHelper from "../schema-helper";

describe("Integration | Serializers | Base | Overriding Serialize", function() {
  let schema;

  beforeEach(function() {
    schema = schemaHelper.setup();
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can use a completely custom serialize function`, () => {
    let registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        serialize() {
          return "blah";
        }
      })
    });

    let wordSmith = schema.wordSmiths.create({
      id: 1,
      title: "Link"
    });

    let result = registry.serialize(wordSmith);

    expect(result).toEqual("blah");
  });

  test(`it can access the request in a custom serialize function`, () => {
    let registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        serialize(response, request) {
          return request.queryParams.foo || "blah";
        }
      })
    });

    let wordSmith = schema.wordSmiths.create({
      id: 1,
      title: "Link"
    });

    let request = {
      url: "/word-smiths/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" }
    };
    let result = registry.serialize(wordSmith, request);

    expect(result).toEqual("bar");
  });

  test(`it can access the databse while in a serializer method`, () => {
    let registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        serialize(response, request) {
          let id = request.params.id;
          return schema.db.wordSmiths.find(id).title || "No title";
        }
      })
    });

    let wordSmith = schema.wordSmiths.create({
      id: 1,
      title: "Title in database"
    });

    let request = {
      url: "/word-smiths/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" }
    };
    let result = registry.serialize(wordSmith, request);

    expect(result).toEqual("Title in database");
  });
});
