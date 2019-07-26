import {
  Server
} from "../../lib";

describe("Unit | Load Fixtures", function() {
  let server;

  beforeEach(function() {
    server = new Server({
      environment: "development",
      scenarios: {
        default() {}
      },
      factories: {
        author: {},
        post: {},
        comment: {}
      },
      fixtures: {
        authors: [{ id: 1, name: "Zelda" }, { id: 2, name: "Link" }],
        posts: [{ id: 1, title: "Lorem" }, { id: 2, title: "Ipsum" }],
        comments: [{ id: 1, title: "Lorem" }]
      }
    });
  });

  afterEach(function() {
    server.shutdown();
  });

  test("it can load all fixtures in the map", () => {
    expect.assertions(3);

    server.loadFixtures();

    expect(server.db.authors).toHaveLength(2);
    expect(server.db.posts).toHaveLength(2);
    expect(server.db.comments).toHaveLength(1);
  });

  test("it can load a single named fixture file", () => {
    expect.assertions(3);

    server.loadFixtures("authors");

    expect(server.db.authors).toHaveLength(2);
    expect(server.db.posts).toHaveLength(0);
    expect(server.db.comments).toHaveLength(0);
  });

  test("it can load several named single fixtures", () => {
    expect.assertions(3);

    server.loadFixtures("authors", "posts");

    expect(server.db.authors).toHaveLength(2);
    expect(server.db.posts).toHaveLength(2);
    expect(server.db.comments).toHaveLength(0);
  });

  test("it throws on a non-existing file name", () => {
    expect(() => server.loadFixtures("authors", "zomg", "posts", "lol"))
      .toThrow('Fixtures not found: zomg, lol');
  });
});
