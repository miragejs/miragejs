import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Embedded Models", function () {
  let server, BaseSerializer;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model.extend({
          posts: hasMany("blogPost", { inverse: "author" }),
        }),
        blogPost: Model.extend({
          author: belongsTo("wordSmith", { inverse: "posts" }),
          comments: hasMany("fineComment", { inverse: "post" }),
        }),
        fineComment: Model.extend({
          post: belongsTo("blogPost"),
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({ name: "Link" });
    let post = wordSmith.createPost({ title: "Lorem" });
    post.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    server.schema.wordSmiths.create({ name: "Zelda" });

    BaseSerializer = Serializer.extend({
      embed: true,
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can embed has-many relationships`, () => {
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
        posts: [
          { id: "1", title: "Lorem" },
          { id: "2", title: "Ipsum" },
        ],
      },
    });
  });

  test(`it can embed a chain of has-many relationships`, () => {
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

    let wordSmith = server.schema.wordSmiths.find(1);
    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        posts: [
          { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
          { id: "2", title: "Ipsum", comments: [] },
        ],
      },
    });
  });

  test(`it can embed a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        blogPost: BaseSerializer.extend({
          embed: true,
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
        author: { id: "1", name: "Link" },
      },
    });
  });

  test(`it can serialize a chain of belongs-to relationships`, () => {
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
        post: {
          id: "1",
          title: "Lorem",
          author: {
            id: "1",
            name: "Link",
          },
        },
      },
    });
  });

  test(`it can have a null value on a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        blogPost: BaseSerializer.extend({
          embed: true,
          include: ["author"],
        }),
      },
    });

    let blogPost = server.schema.blogPosts.find(1);
    blogPost.update("author", null);
    let result = server.serializerOrRegistry.serialize(blogPost);

    expect(result).toEqual({
      blogPost: {
        id: "1",
        title: "Lorem",
      },
    });
  });

  test(`it ignores relationships that refer to serialized ancestor resources`, () => {
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

    let wordSmith = server.schema.wordSmiths.find(1);
    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        posts: [
          { id: "1", title: "Lorem" },
          { id: "2", title: "Ipsum" },
        ],
      },
    });
  });

  test(`it ignores relationships that refer to serialized ancestor resources, multiple levels down`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          embed: true,
          include: ["posts"],
        }),
        blogPost: BaseSerializer.extend({
          include: ["author", "comments"],
        }),
        fineComment: BaseSerializer.extend({
          include: ["post"],
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.find(1);
    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
        posts: [
          { id: "1", title: "Lorem", comments: [{ id: "1", text: "pwned" }] },
          { id: "2", title: "Ipsum", comments: [] },
        ],
      },
    });
  });
});
