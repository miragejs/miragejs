import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";
import schemaHelper from "../schema-helper";

describe("Integration | Serializers | Base | Assorted Collections", function() {
  let schema, registry, wordSmiths, greatPhotos;

  beforeEach(function() {
    schema = schemaHelper.setup();
    registry = new SerializerRegistry(schema, {
      greatPhoto: Serializer.extend({
        attrs: ["id", "title"]
      })
    });
    wordSmiths = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
      { id: "3", name: "Epona" }
    ];
    greatPhotos = [
      { id: "1", title: "Amazing", location: "Hyrule" },
      { id: "2", title: "greatPhoto", location: "Goron City" }
    ];
    schema.db.loadData({
      wordSmiths: wordSmiths,
      greatPhotos: greatPhotos
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`an array of assorted collections can be serialized`, () => {
    let result = registry.serialize([
      schema.wordSmiths.all(),
      schema.greatPhotos.all()
    ]);

    expect(result).toEqual({
      wordSmiths: wordSmiths,
      greatPhotos: greatPhotos.map(attrs => {
        delete attrs.location;
        return attrs;
      })
    });
  });
});
