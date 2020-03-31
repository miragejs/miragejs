import { Server, Model, hasMany, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Sideloading Assorted Collections", function () {
  let server, wordSmiths, blogPosts, greatPhotos;

  beforeEach(function () {
    let BaseSerializer = Serializer.extend({
      embed: false,
    });

    server = new Server({
      models: {
        wordSmith: Model.extend({
          blogPosts: hasMany(),
        }),
        blogPost: Model,
        greatPhoto: Model,
      },
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          include: ["blogPosts"],
        }),
        greatPhoto: BaseSerializer.extend({
          attrs: ["id", "title"],
        }),
      },
    });

    wordSmiths = [
      { id: "1", name: "Link", blogPostIds: ["1", "2"] },
      { id: "2", name: "Zelda", blogPostIds: [] },
      { id: "3", name: "Epona", blogPostIds: [] },
    ];
    blogPosts = [
      { id: "1", title: "Lorem" },
      { id: "2", title: "Ipsum" },
    ];
    greatPhotos = [
      { id: "1", title: "Amazing", location: "Hyrule" },
      { id: "2", title: "greatPhoto", location: "Goron City" },
    ];

    server.db.loadData({
      wordSmiths: wordSmiths,
      blogPosts: blogPosts,
      greatPhotos: greatPhotos,
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  /*
    This is a strange response from a route handler, but it's used in the array get shorthand. Deprecate that shorthand?
  */
  test(`it can sideload an array of assorted collections that have relationships`, () => {
    let result = server.serializerOrRegistry.serialize([
      server.schema.wordSmiths.all(),
      server.schema.greatPhotos.all(),
    ]);

    expect(result).toEqual({
      wordSmiths: wordSmiths,
      blogPosts: blogPosts,
      greatPhotos: greatPhotos.map((attrs) => {
        delete attrs.location;
        return attrs;
      }),
    });
  });
});
