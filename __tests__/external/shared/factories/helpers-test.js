import {
  Model,
  Server,
  Factory,
  belongsTo,
  hasMany,
  trait,
  association,
} from "miragejs";

describe("Eternal | Shared | Factories | helpers", () => {
  let server;

  afterEach(() => {
    server.shutdown();
  });

  test('it creates associations with "association" helper in a dasherized factory', () => {
    server = new Server({
      environment: "test",
      models: {
        author: Model.extend({
          blogPosts: hasMany(),
        }),
        blogPost: Model.extend({
          author: belongsTo(),
        }),
      },
      factories: {
        author: Factory.extend({
          name: "Sam",
        }),
        blogPost: Factory.extend({
          title: "Lorem ipsum",

          author: association(),
        }),
      },
    });

    let blogPost = server.create("blog-post");

    expect(blogPost.author).toBeTruthy();

    let { db } = server;

    expect(db.authors).toHaveLength(1);
    expect(db.authors[0]).toEqual({
      id: "1",
      name: "Sam",
      blogPostIds: ["1"],
    });
  });

  test('it creates associations with "association" helper combininig with traits', () => {
    server = new Server({
      environment: "test",
      models: {
        author: Model.extend({
          posts: hasMany(),
        }),
        category: Model.extend({
          posts: hasMany("post", { inverse: "kind" }),
        }),
        post: Model.extend({
          author: belongsTo(),
          kind: belongsTo("category"),
        }),
      },
      factories: {
        author: Factory.extend({
          name: "Sam",
        }),
        category: Factory.extend({
          name: "awesome software",
        }),
        post: Factory.extend({
          title: "Lorem ipsum",

          author: association(),

          withCategory: trait({
            kind: association(),
          }),
        }),
      },
    });

    let post = server.create("post", "withCategory");

    expect(post.kind).toBeTruthy();
    expect(post.author).toBeTruthy();

    let { db } = server;

    expect(db.posts).toHaveLength(1);
    expect(db.posts[0]).toEqual({
      id: "1",
      title: "Lorem ipsum",
      authorId: "1",
      kindId: "1",
    });

    expect(db.authors).toHaveLength(1);
    expect(db.authors[0]).toEqual({
      id: "1",
      name: "Sam",
      postIds: ["1"],
    });

    expect(db.categories).toHaveLength(1);
    expect(db.categories[0]).toEqual({
      id: "1",
      name: "awesome software",
      postIds: ["1"],
    });
  });

  test("it throws if using the association helper on a self-referential belongsTo relationship", () => {
    server = new Server({
      environment: "test",
      models: {
        page: Model.extend({
          parentPage: belongsTo("page", { inverse: "childPages" }),
          childPages: hasMany("page", { inverse: "parentPage" }),
        }),
      },
      factories: {
        page: Factory.extend({
          parentPage: association(),
        }),
      },
    });

    expect(() => {
      server.create("page");
    }).toThrow();
  });

  test("it throws if using the association helper with polymorphic relationship", () => {
    server = new Server({
      environment: "test",
      models: {
        author: Model.extend({
          anyPost: belongsTo("base-post", { polymorphic: true }),
        }),
        basePost: Model.extend({}),
      },
      factories: {
        author: Factory.extend({
          anyPost: association(),
        }),
      },
    });

    expect(() => {
      server.create("author");
    }).toThrow();
  });
});
