import { Server, Model, hasMany, belongsTo } from "miragejs";

describe("External | Shared | ORM | assertions", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      models: {
        user: Model.extend({
          posts: hasMany(),
        }),
        post: Model.extend({
          author: belongsTo("user"),
        }),
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it errors when passing in the wrong type for a HasMany association", () => {
    expect(() => {
      server.schema.users.create({
        name: "Sam",
        posts: [1],
      });
    }).toThrow();
  });

  test(`it doesn't error when passing in an empty array`, () => {
    server.schema.users.create({
      name: "Sam",
      posts: [],
    });
    expect(true).toBeTruthy();
  });

  test("it errors when passing in the wrong type for a HasMany association foreign key", () => {
    expect(() => {
      server.schema.users.create({
        name: "Sam",
        postIds: "foo",
      });
    }).toThrow();
  });

  test("it errors when passing in a missing foreign key for a HasMany association foreign key", () => {
    expect(() => {
      server.schema.users.create({
        name: "Sam",
        postIds: [2],
      });
    }).toThrow();
  });

  test("it errors when passing in the wrong type for a BelongsTo association", () => {
    expect(() => {
      server.schema.posts.create({
        title: "Post 1",
        author: "sam",
      });
    }).toThrow();
  });

  test("it errors when passing in a missing foreign key for a BelongsTo association foreign key", () => {
    expect(() => {
      server.schema.posts.create({
        title: "Post 1",
        authorId: 1,
      });
    }).toThrow();
  });
});
