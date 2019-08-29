import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";
import schemaHelper from "../schema-helper";

describe("Integration | Serializers | Base | Array of Models", function() {
  let schema;

  beforeEach(function() {
    schema = schemaHelper.setup();
    schema.wordSmiths.create({ id: 1, title: "Link" });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it applies correct serializer when the response is an array of models`, () => {
    expect.assertions(1);

    let wordSmiths = schema.wordSmiths.all().filter(() => true);
    let registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        serialize() {
          expect("serializer ran").toBeTruthy();
          return {};
        }
      })
    });

    registry.serialize(wordSmiths);
  });
});
