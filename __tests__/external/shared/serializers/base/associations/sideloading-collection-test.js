import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Sideloading Collections", function () {
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

  test(`it throws an error if embed is false and root is false`, () => {
    server.config({
      serializers: {
        wordSmith: BaseSerializer.extend({
          root: false,
          include: ["posts"],
        }),
      },
    });

    let wordSmiths = server.schema.wordSmiths.all();

    expect(function () {
      server.serializerOrRegistry.serialize(wordSmiths);
    }).toThrow();
  });

  test(`it can sideload an empty collection`, () => {
    server.schema.db.emptyData();
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          include: ["posts"],
        }),
      },
    });

    let result = server.serializerOrRegistry.serialize(
      server.schema.wordSmiths.all()
    );

    expect(result).toEqual({
      wordSmiths: [],
    });
  });

  test(`it can sideload a collection with a has-many relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          embed: false,
          include: ["posts"],
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
        { id: "1", title: "Lorem" },
        { id: "2", title: "Ipsum" },
        { id: "3", title: "Zeldas blogPost" },
      ],
    });
  });

  test(`it can sideload a collection with a chain of has-many relationships`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          embed: false,
          include: ["posts"],
        }),
        blogPost: BaseSerializer.extend({
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
        { id: "1", title: "Lorem", commentIds: ["1"] },
        { id: "2", title: "Ipsum", commentIds: [] },
        { id: "3", title: "Zeldas blogPost", commentIds: [] },
      ],
      fineComments: [{ id: "1", text: "pwned" }],
    });
  });

  test(`it avoids circularity when serializing a collection`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          embed: false,
          include: ["posts"],
        }),
        blogPost: BaseSerializer.extend({
          include: ["author"],
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
        { id: "1", title: "Lorem", authorId: "1" },
        { id: "2", title: "Ipsum", authorId: "1" },
        { id: "3", title: "Zeldas blogPost", authorId: "2" },
      ],
    });
  });

  test(`it can sideload a collection with a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        blogPost: BaseSerializer.extend({
          embed: false,
          include: ["author"],
        }),
      },
    });

    let blogPosts = server.schema.blogPosts.all();
    let result = server.serializerOrRegistry.serialize(blogPosts);

    expect(result).toEqual({
      blogPosts: [
        { id: "1", title: "Lorem", authorId: "1" },
        { id: "2", title: "Ipsum", authorId: "1" },
        { id: "3", title: "Zeldas blogPost", authorId: "2" },
      ],
      wordSmiths: [
        { id: "1", name: "Link" },
        { id: "2", name: "Zelda" },
      ],
    });
  });

  test(`it can sideload a collection with a chain of belongs-to relationships`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        fineComment: BaseSerializer.extend({
          embed: false,
          include: ["post"],
        }),
        blogPost: BaseSerializer.extend({
          include: ["author"],
        }),
      },
    });

    let fineComments = server.schema.fineComments.all();
    let result = server.serializerOrRegistry.serialize(fineComments);

    expect(result).toEqual({
      fineComments: [{ id: "1", text: "pwned", postId: "1" }],
      blogPosts: [{ id: "1", title: "Lorem", authorId: "1" }],
      wordSmiths: [{ id: "1", name: "Link" }],
    });
  });
});
