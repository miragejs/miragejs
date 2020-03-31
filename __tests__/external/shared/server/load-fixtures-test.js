import { Server } from "miragejs";

describe("External | Shared | Server | loadFixtures", () => {
  let server;
  beforeEach(() => {
    server = new Server({
      environment: "test",
      factories: {
        author: {},
        post: {},
        comment: {},
      },
      fixtures: {
        authors: [
          { id: 1, name: "Zelda" },
          { id: 2, name: "Link" },
        ],
        posts: [
          { id: 1, title: "Lorem" },
          { id: 2, title: "Ipsum" },
        ],
        comments: [{ id: 1, title: "Lorem" }],
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it can load all fixtures in the map", () => {
    server.loadFixtures();

    expect(server.db.authors).toHaveLength(2);
    expect(server.db.posts).toHaveLength(2);
    expect(server.db.comments).toHaveLength(1);
  });

  test("it can load a single named fixture file", () => {
    server.loadFixtures("authors");

    expect(server.db.authors).toHaveLength(2);
    expect(server.db.posts).toHaveLength(0);
    expect(server.db.comments).toHaveLength(0);
  });

  test("it can load several named single fixtures", () => {
    server.loadFixtures("authors", "posts");

    expect(server.db.authors).toHaveLength(2);
    expect(server.db.posts).toHaveLength(2);
    expect(server.db.comments).toHaveLength(0);
  });

  test("it throws on a non-existing file name", () => {
    expect(() =>
      server.loadFixtures("authors", "zomg", "posts", "lol")
    ).toThrow("Fixtures not found: zomg, lol");
  });
});
