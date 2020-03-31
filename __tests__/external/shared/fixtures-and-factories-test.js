import { Server, Model, Factory } from "miragejs";

describe("External | Shared | Fixtures and factories", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        author: Model,
      },
      factories: {
        author: Factory,
      },
      seeds() {},
      fixtures: {
        authors: [{ id: 1, name: "Zelda" }],
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`[regression] When loaded, fixture files correctly update the database's autoincrement id`, () => {
    server.loadFixtures();

    server.schema.authors.create({});

    let authors = server.db.authors;

    expect(authors).toHaveLength(2);
    expect(authors.map((a) => a.id)).toEqual(["1", "2"]);
  });
});
