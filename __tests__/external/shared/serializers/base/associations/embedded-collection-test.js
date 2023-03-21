import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Embedded Collections", function () {
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
    let blogPost = wordSmith.createPost({ title: "Lorem" });
    blogPost.createComment({ text: "pwned" });

    wordSmith.createPost({ title: "Ipsum" });

    server.schema.wordSmiths.create({ name: "Zelda" });

    BaseSerializer = Serializer.extend({
      embed: true,
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can embed a collection with a has-many relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        wordSmith: BaseSerializer.extend({
          include: ["posts"],
        }),
      },
    });

    let wordSmiths = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [
        {
          id: "1",
          name: "Link",
          posts: [
            { id: "1", title: "Lorem" },
            { id: "2", title: "Ipsum" },
          ],
        },
        {
          id: "2",
          name: "Zelda",
          posts: [],
        },
      ],
    });
  });

  test(`it can embed a collection with a chain of has-many relationships`, () => {
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

    let wordSmiths = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [
        {
          id: "1",
          name: "Link",
          posts: [
            {
              id: "1",
              title: "Lorem",
              comments: [{ id: "1", text: "pwned" }],
            },
            {
              id: "2",
              title: "Ipsum",
              comments: [],
            },
          ],
        },
        {
          id: "2",
          name: "Zelda",
          posts: [],
        },
      ],
    });
  });

  test(`it can embed a collection with a belongs-to relationship`, () => {
    server.config({
      serializers: {
        application: BaseSerializer,
        blogPost: BaseSerializer.extend({
          include: ["author"],
        }),
      },
    });

    let blogPosts = server.schema.blogPosts.all();
    let result = server.serializerOrRegistry.serialize(blogPosts);

    expect(result).toEqual({
      blogPosts: [
        {
          id: "1",
          title: "Lorem",
          author: { id: "1", name: "Link" },
        },
        {
          id: "2",
          title: "Ipsum",
          author: { id: "1", name: "Link" },
        },
      ],
    });
  });

  test(`it can embed a collection with a chain of belongs-to relationships`, () => {
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

    let fineComments = server.schema.fineComments.all();
    let result = server.serializerOrRegistry.serialize(fineComments);

    expect(result).toEqual({
      fineComments: [
        {
          id: "1",
          text: "pwned",
          post: {
            id: "1",
            title: "Lorem",
            author: { id: "1", name: "Link" },
          },
        },
      ],
    });
  });

  describe(`'embed' takes precedence over 'serializeIds'`, () => {
    test(`it entirely overrides serializeIds`, () => {
      const EmbedSerializer = Serializer.extend({
        embed: true,
        serializeIds: "always",
      });

      server.config({
        serializers: {
          application: EmbedSerializer,
          blogPost: EmbedSerializer.extend({
            include: ["author", "comments"],
          }),
        },
      });

      const post = server.schema.blogPosts.first();
      const result = server.serializerOrRegistry.serialize(post);

      expect(result).toEqual({
        blogPost: {
          id: "1",
          title: "Lorem",
          comments: [
            {
              id: "1",
              text: "pwned",
            },
          ],
          author: {
            id: "1",
            name: "Link",
          },
        },
      });
    });

    test(`it selectively overrides serializeIds`, () => {
      const SelectiveSerializer = Serializer.extend({
        embed: (key) => key === "comments",
        serializeIds: "always",
      });

      server.config({
        serializers: {
          application: SelectiveSerializer,
          blogPost: SelectiveSerializer.extend({
            include: ["author", "comments"],
          }),
        },
      });

      const post = server.schema.blogPosts.first();
      const result = server.serializerOrRegistry.serialize(post);

      expect(result).toEqual({
        blogPost: {
          id: "1",
          title: "Lorem",
          authorId: "1",
          comments: [
            {
              id: "1",
              text: "pwned",
              postId: "1",
            },
          ],
        },
        wordSmiths: [
          {
            id: "1",
            name: "Link",
            postIds: ["1", "2"],
          },
        ],
      });
    });
  });
});
