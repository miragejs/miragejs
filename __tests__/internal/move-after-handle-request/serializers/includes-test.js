import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("Internal | MoveAfterHandleRequest | Serializers | includes", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
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
      routes() {
        this.resource("blog-posts");
      },
    });

    let wordSmith = server.schema.wordSmiths.create({ name: "Link" });
    let blogPost = wordSmith.createPost({ title: "Lorem" });
    blogPost.createComment({ text: "pwned" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("include can be an array of relationship names", async () => {
    server.config({
      serializers: {
        blogPost: Serializer.extend({
          include: ["author", "comments"],
        }),
      },
    });

    let json = await fetch("/blog-posts/1").then((res) => res.json());

    expect(json).toEqual({
      blogPost: {
        authorId: "1",
        commentIds: ["1"],
        id: "1",
        title: "Lorem",
      },
      fineComments: [
        {
          id: "1",
          text: "pwned",
        },
      ],
      wordSmiths: [
        {
          id: "1",
          name: "Link",
        },
      ],
    });
  });

  test("include can be a function", async () => {
    server.config({
      serializers: {
        blogPost: Serializer.extend({
          include() {
            return ["comments"];
          },
        }),
      },
    });

    let json = await fetch("/blog-posts/1").then((res) => res.json());

    expect(json).toEqual({
      blogPost: {
        commentIds: ["1"],
        id: "1",
        title: "Lorem",
      },
      fineComments: [
        {
          id: "1",
          text: "pwned",
        },
      ],
    });
  });

  test("include gets the request as the first param", async () => {
    server.config({
      serializers: {
        blogPost: Serializer.extend({
          include(request) {
            return request.queryParams.include ? ["comments"] : [];
          },
        }),
      },
    });

    let json = await fetch("/blog-posts/1?include").then((res) => res.json());

    expect(json).toEqual({
      blogPost: {
        commentIds: ["1"],
        id: "1",
        title: "Lorem",
      },
      fineComments: [
        {
          id: "1",
          text: "pwned",
        },
      ],
    });
  });

  test("include gets the model as the second param", async () => {
    server.config({
      serializers: {
        blogPost: Serializer.extend({
          include(request, model) {
            return Object.keys(model.associations);
          },
        }),
      },
    });

    let json = await fetch("/blog-posts/1?include").then((res) => res.json());

    expect(json).toEqual({
      blogPost: {
        authorId: "1",
        commentIds: ["1"],
        id: "1",
        title: "Lorem",
      },
      fineComments: [
        {
          id: "1",
          text: "pwned",
        },
      ],
      wordSmiths: [
        {
          id: "1",
          name: "Link",
        },
      ],
    });
  });

  test("serializer.schema is exposed", async () => {
    server.config({
      serializers: {
        blogPost: Serializer.extend({
          include(request, resource) {
            return Object.keys(this.schema.associationsFor(resource.modelName));
          },
        }),
      },
    });

    let json = await fetch("/blog-posts/1?include").then((res) => res.json());

    expect(json).toEqual({
      blogPost: {
        authorId: "1",
        commentIds: ["1"],
        id: "1",
        title: "Lorem",
      },
      fineComments: [
        {
          id: "1",
          text: "pwned",
        },
      ],
      wordSmiths: [
        {
          id: "1",
          name: "Link",
        },
      ],
    });
  });
});
