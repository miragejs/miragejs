import { Server, Model, hasMany, belongsTo, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Full Request", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        author: Model.extend({
          posts: hasMany(),
        }),
        post: Model.extend({
          author: belongsTo(),
          comments: hasMany(),
        }),
        comment: Model.extend({
          post: belongsTo(),
        }),
      },
      serializers: {
        application: Serializer.extend({
          embed: true,
          root: false,
        }),
        author: Serializer.extend({
          embed: true,
          attrs: ["id", "first"],
          include: ["posts"],
        }),
        comment: Serializer.extend({
          embed: true,
          root: false,
          include(request) {
            return request.queryParams.include_post ? ["post"] : [];
          },
        }),
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("the appropriate serializer is used", async () => {
    expect.assertions(1);

    let author = server.schema.authors.create({
      first: "Link",
      last: "of Hyrule",
      age: 323,
    });
    author.createPost({ title: "Lorem ipsum" });

    server.get("/authors/:id", function (schema, request) {
      let { id } = request.params;

      return schema.authors.find(id);
    });

    let res = await fetch("/authors/1");
    let data = await res.json();

    expect(data).toEqual({
      author: {
        id: "1",
        first: "Link",
        posts: [{ id: "1", title: "Lorem ipsum" }],
      },
    });
  });

  test("components decoded", async () => {
    expect.assertions(1);

    server.get("/authors/:id", function (schema, request) {
      let { id } = request.params;

      return { data: { id } };
    });

    let res = await fetch("/authors/%3A1");
    let data = await res.json();

    expect(data).toEqual({ data: { id: ":1" } });
  });

  test("a response falls back to the application serializer, if it exists", async () => {
    expect.assertions(1);
    server.schema.posts.create({
      title: "Lorem",
      date: "20001010",
    });

    server.get("/posts/:id", function (schema, request) {
      let { id } = request.params;

      return schema.posts.find(id);
    });

    let res = await fetch("/posts/1");
    let data = await res.json();

    expect(data).toEqual({
      id: "1",
      title: "Lorem",
      date: "20001010",
    });
  });

  test("serializer.include is invoked when it is a function", async () => {
    expect.assertions(1);
    let post = server.schema.posts.create({
      title: "Lorem",
      date: "20001010",
    });
    post.createComment({
      description: "Lorem is the best",
    });

    server.get("/comments/:id", function (schema, request) {
      let { id } = request.params;
      return schema.comments.find(id);
    });

    let res = await fetch("/comments/1?include_post=true");
    let data = await res.json();

    expect(data).toEqual({
      id: "1",
      description: "Lorem is the best",
      post: {
        id: "1",
        title: "Lorem",
        date: "20001010",
      },
    });
  });
});
