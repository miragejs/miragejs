import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Sideloading Models", function () {
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

    let wordSmith = server.schema.wordSmiths.create({ name: "Link" });
    let blogPost = wordSmith.createPost({ title: "Lorem" });
    blogPost.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    server.schema.wordSmiths.create({ name: "Zelda" });

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

    let link = server.schema.wordSmiths.find(1);
    expect(function () {
      server.serializerOrRegistry.serialize(link);
    }).toThrow();
  });

  test(`it can sideload a model with a has-many relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          include: ["posts"],
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
        { id: "1", title: "Lorem" },
        { id: "2", title: "Ipsum" },
      ],
    });
  });

  test(`it can sideload a model with a chain of has-many relationships`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          include: ["posts"],
        }),
        blogPost: BaseSerializer.extend({
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
        { id: "1", title: "Lorem", commentIds: ["1"] },
        { id: "2", title: "Ipsum", commentIds: [] },
      ],
      fineComments: [{ id: "1", text: "pwned" }],
    });
  });

  test(`it avoids circularity when serializing a model`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          include: ["posts"],
        }),
        blogPost: BaseSerializer.extend({
          include: ["author"],
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
        { id: "1", title: "Lorem", authorId: "1" },
        { id: "2", title: "Ipsum", authorId: "1" },
      ],
    });
  });

  test(`it can sideload a model with a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        blogPost: BaseSerializer.extend({
          include: ["author"],
        }),
      },
    });

    let blogPost = server.schema.blogPosts.find(1);
    let result = server.serializerOrRegistry.serialize(blogPost);

    expect(result).toEqual({
      blogPost: {
        id: "1",
        title: "Lorem",
        authorId: "1",
      },
      wordSmiths: [{ id: "1", name: "Link" }],
    });
  });

  test(`it can sideload a model with a chain of belongs-to relationships`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        fineComment: BaseSerializer.extend({
          include: ["post"],
        }),
        blogPost: BaseSerializer.extend({
          include: ["author"],
        }),
      },
    });

    let fineComment = server.schema.fineComments.find(1);
    let result = server.serializerOrRegistry.serialize(fineComment);

    expect(result).toEqual({
      fineComment: {
        id: "1",
        text: "pwned",
        postId: "1",
      },
      blogPosts: [{ id: "1", title: "Lorem", authorId: "1" }],
      wordSmiths: [{ id: "1", name: "Link" }],
    });
  });
});
