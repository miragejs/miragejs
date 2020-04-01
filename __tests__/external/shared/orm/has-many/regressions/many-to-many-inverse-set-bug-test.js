import { Server, Model, hasMany } from "miragejs";

describe("External | Shared | ORM | Has Many | Regressions | Many to many inverse set bug", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        post: Model.extend({
          tags: hasMany(),
        }),
        tag: Model.extend({
          posts: hasMany(),
        }),
      },
    });
  });

  test(`it works`, () => {
    server.db.loadData({
      posts: [
        { id: "1", tagIds: ["15", "16"] },
        { id: "2", tagIds: ["16"] },
      ],
      tags: [
        { id: "15", postIds: ["1"] },
        { id: "16", postIds: ["1", "2"] },
      ],
    });

    server.schema.posts.find(1).update({ tagIds: ["15"] });

    expect(server.db.posts.find(1).tagIds).toEqual(["15"]);
    expect(server.db.tags.find(15).postIds).toEqual(["1"]);
    expect(server.db.tags.find(16).postIds).toEqual(["2"]);
  });
});
