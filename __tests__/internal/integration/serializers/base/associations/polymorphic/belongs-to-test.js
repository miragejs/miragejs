import { Model, belongsTo } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Polymorphic | Belongs To", function() {
  let schema, BaseSerializer;

  beforeEach(function() {
    schema = new Schema(new Db(), {
      post: Model.extend(),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true })
      })
    });

    let post = schema.posts.create({ title: "Lorem ipsum" });
    schema.comments.create({ commentable: post, text: "Foo" });

    BaseSerializer = Serializer.extend({
      embed: false
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can serialize a polymorphic belongs-to relationship`, () => {
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      comment: BaseSerializer.extend({
        include: ["commentable"]
      })
    });

    let comment = schema.comments.find(1);
    let result = registry.serialize(comment);

    expect(result).toEqual({
      comment: {
        id: "1",
        text: "Foo",
        commentableType: "post",
        commentableId: "1"
      },
      posts: [{ id: "1", title: "Lorem ipsum" }]
    });
  });
});
