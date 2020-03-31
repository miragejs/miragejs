import { Server, Model, hasMany, belongsTo, JSONAPISerializer } from "miragejs";
import { underscore } from "@lib/utils/inflector";

describe("Integration | Server | Regressions | 1322 Relationship Path Normalization Test", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        happyUser: Model.extend({
          happyLicenses: hasMany(),
          happyAvatar: belongsTo(),
        }),
        happyLicense: Model.extend({
          happyUser: belongsTo(),
        }),
        happyAvatar: Model.extend({
          happyUser: belongsTo(),
        }),
      },
      serializers: {
        application: JSONAPISerializer.extend({
          keyForRelationship(relationshipName) {
            return underscore(relationshipName);
          },
        }),
      },
      routes() {
        this.resource("happy-licenses");
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it works", async () => {
    let avatar1 = server.create("happy-avatar");
    let user1 = server.create("happy-user", { happyAvatar: avatar1 });
    server.create("happy-license", { happyUser: user1 });

    expect.assertions(2);

    let res = await fetch("/happy-licenses/1?include=happy_user.happy_avatar");
    let json = await res.json();

    expect(json.data).toEqual({
      attributes: {},
      id: "1",
      relationships: {
        happy_user: {
          data: {
            id: user1.id,
            type: "happy-users",
          },
        },
      },
      type: "happy-licenses",
    });
    expect(json.included).toEqual([
      {
        id: user1.id,
        type: "happy-users",
        attributes: {},
        relationships: {
          happy_avatar: {
            data: {
              id: avatar1.id,
              type: "happy-avatars",
            },
          },
        },
      },
      {
        id: avatar1.id,
        type: "happy-avatars",
        attributes: {},
      },
    ]);
  });
});
