import { Server, Model, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Assorted Collections", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model,
        greatPhoto: Model,
      },

      serializers: {
        application: Serializer,
        greatPhoto: Serializer.extend({
          attrs: ["id", "title"],
        }),
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`an array of assorted collections can be serialized`, () => {
    let wordSmiths = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
      { id: "3", name: "Epona" },
    ];
    let greatPhotos = [
      { id: "1", title: "Amazing", location: "Hyrule" },
      { id: "2", title: "greatPhoto", location: "Goron City" },
    ];

    server.db.loadData({ wordSmiths, greatPhotos });

    let result = server.serializerOrRegistry.serialize([
      server.schema.wordSmiths.all(),
      server.schema.greatPhotos.all(),
    ]);

    expect(result).toEqual({
      wordSmiths: wordSmiths,
      greatPhotos: greatPhotos.map((attrs) => {
        delete attrs.location;
        return attrs;
      }),
    });
  });
});
