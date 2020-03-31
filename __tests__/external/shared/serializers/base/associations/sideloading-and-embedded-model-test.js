import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Sideloading and Embedded Models", function () {
  let server, BaseSerializer;

  beforeEach(function () {
    BaseSerializer = Serializer.extend({
      embed: false,
    });

    server = new Server({
      models: {
        wordSmith: Model.extend({
          posts: hasMany("blog-post"),
        }),
        blogPost: Model.extend({
          author: belongsTo("word-smith"),
          comments: hasMany("fine-comment"),
        }),
        fineComment: Model.extend({
          post: belongsTo("blog-post"),
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({ name: "Link" });
    let blogPost = wordSmith.createPost({ title: "Lorem" });
    blogPost.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    server.schema.wordSmiths.create({ name: "Zelda" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can sideload a model with a has-many relationship containing embedded models`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          embed: false,
          include: ["posts"],
        }),
        blogPost: BaseSerializer.extend({
          embed: true,
          include: ["comments"],
        }),
      },
    });

    let link = server.schema.wordSmiths.find(1);
    let result = server.serializerOrRegistry.serialize(link);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        postIds: ["1", "2"],
      },
      blogPosts: [
        { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
        { id: "2", title: "Ipsum", comments: [] },
      ],
    });
  });

  test(`it can sideload a model with a belongs-to relationship containing embedded models`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        fineComment: BaseSerializer.extend({
          embed: false,
          include: ["post"],
        }),
        blogPost: BaseSerializer.extend({
          embed: true,
          include: ["author"],
        }),
      },
    });

    let fineComment = server.schema.fineComments.find(1);
    let result = server.serializerOrRegistry.serialize(fineComment);

    expect(result).toEqual({
      fineComment: { id: "1", text: "pwned", postId: "1" },
      blogPosts: [
        {
          id: "1",
          title: "Lorem",
          author: { id: "1", name: "Link" },
        },
      ],
    });
  });
});
