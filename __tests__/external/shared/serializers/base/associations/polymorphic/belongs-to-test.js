import { Server, Model, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Polymorphic | Belongs To", function () {
  let server, BaseSerializer;

  beforeEach(function () {
    server = new Server({
      models: {
        post: Model.extend(),
        comment: Model.extend({
          commentable: belongsTo({ polymorphic: true }),
        }),
      },
    });

    let post = server.schema.posts.create({ title: "Lorem ipsum" });
    server.schema.comments.create({ commentable: post, text: "Foo" });

    BaseSerializer = Serializer.extend({
      embed: false,
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can serialize a polymorphic belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        comment: BaseSerializer.extend({
          include: ["commentable"],
        }),
      },
    });

    let comment = server.schema.comments.find(1);
    let result = server.serializerOrRegistry.serialize(comment);

    expect(result).toEqual({
      comment: {
        id: "1",
        text: "Foo",
        commentableType: "post",
        commentableId: "1",
      },
      posts: [{ id: "1", title: "Lorem ipsum" }],
    });
  });
});
