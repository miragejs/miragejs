import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Sideloading and Embedded Collections", function () {
  let server, BaseSerializer;

  beforeEach(function () {
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

    let link = server.schema.wordSmiths.create({ name: "Link" });
    let blogPost = link.createPost({ title: "Lorem" });
    link.createPost({ title: "Ipsum" });

    blogPost.createComment({ text: "pwned" });

    let zelda = server.schema.wordSmiths.create({ name: "Zelda" });
    zelda.createPost({ title: `Zeldas blogPost` });

    BaseSerializer = Serializer.extend({
      embed: false,
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can sideload a collection with a has-many relationship containing embedded models`, () => {
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

    let wordSmiths = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [
        { id: "1", name: "Link", postIds: ["1", "2"] },
        { id: "2", name: "Zelda", postIds: ["3"] },
      ],
      blogPosts: [
        { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
        { id: "2", title: "Ipsum", comments: [] },
        { id: "3", title: "Zeldas blogPost", comments: [] },
      ],
    });
  });

  test(`it can sideload a collection with a belongs-to relationship containing embedded models`, () => {
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

    let fineComments = server.schema.fineComments.all();
    let result = server.serializerOrRegistry.serialize(fineComments);

    expect(result).toEqual({
      fineComments: [{ id: "1", text: "pwned", postId: "1" }],
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
