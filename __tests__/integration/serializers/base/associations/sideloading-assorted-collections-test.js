import { Model, hasMany } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";

describe("Integration | Serializers | Base | Associations | Sideloading Assorted Collections", function() {
  let schema, registry, wordSmiths, blogPosts, greatPhotos;

  beforeEach(function() {
    schema = new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model,
      greatPhoto: Model
    });

    let BaseSerializer = Serializer.extend({
      embed: false
    });
    registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      wordSmith: BaseSerializer.extend({
        include: ["blogPosts"]
      }),
      greatPhoto: BaseSerializer.extend({
        attrs: ["id", "title"]
      })
    });
    wordSmiths = [
      { id: "1", name: "Link", blogPostIds: ["1", "2"] },
      { id: "2", name: "Zelda", blogPostIds: [] },
      { id: "3", name: "Epona", blogPostIds: [] }
    ];
    blogPosts = [{ id: "1", title: "Lorem" }, { id: "2", title: "Ipsum" }];
    greatPhotos = [
      { id: "1", title: "Amazing", location: "Hyrule" },
      { id: "2", title: "greatPhoto", location: "Goron City" }
    ];
    schema.db.loadData({
      wordSmiths: wordSmiths,
      blogPosts: blogPosts,
      greatPhotos: greatPhotos
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  /*
    This is a strange response from a route handler, but it's used in the array get shorthand. Deprecate that shorthand?
  */
  test(`it can sideload an array of assorted collections that have relationships`, () => {
    let result = registry.serialize([
      schema.wordSmiths.all(),
      schema.greatPhotos.all()
    ]);

    expect(result).toEqual({
      wordSmiths: wordSmiths,
      blogPosts: blogPosts,
      greatPhotos: greatPhotos.map(attrs => {
        delete attrs.location;
        return attrs;
      })
    });
  });
});
