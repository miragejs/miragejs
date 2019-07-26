import { module, test } from "qunit";
import Server from "ember-cli-mirage/server";
import { Model, Factory } from "ember-cli-mirage";

module("Integration | Database", function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: "development",
      scenarios: {
        default() {}
      },
      models: {
        author: Model
      },
      factories: {
        author: Factory
      },
      fixtures: {
        authors: [{ id: 1, name: "Zelda" }]
      }
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test(`[regression] When loaded, fixture files correctly update the database's autoincrement id`, assert => {
    this.server.loadFixtures();

    this.server.schema.authors.create({});

    let { authors } = this.server.db;
    expect(authors.length).toEqual(2);
    expect(authors.map(a => a.id)).toEqual(["1", "2"]);
  });
});
