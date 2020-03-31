import { Server, Model, hasMany, belongsTo, JSONAPISerializer } from "miragejs";

describe("Integration | Server | Regressions | 1318 Linkage bug test", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        happyUser: Model.extend({
          happyLicenses: hasMany(),
        }),
        happyLicense: Model.extend({
          happyUser: belongsTo(),
          happySubscription: belongsTo(),
        }),
        happySubscription: Model.extend({
          happyLicenses: hasMany(),
        }),
      },
      serializers: {
        application: JSONAPISerializer,
      },
      routes() {
        this.resource("happy-users");
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it works", async () => {
    let happySubscription = server.create("happy-subscription");

    let user1 = server.create("happy-user");
    server.create("happy-license", {
      happyUser: user1,
      happySubscription,
    });

    let user2 = server.create("happy-user");
    server.create("happy-license", {
      happyUser: user2,
      happySubscription,
    });

    expect.assertions(1);

    let res = await fetch(
      "/happy-users/1?include=happy-licenses.happy-subscription"
    );
    let json = await res.json();

    expect(json.included).toEqual([
      {
        id: "1",
        type: "happy-licenses",
        attributes: {},
        relationships: {
          "happy-subscription": {
            data: {
              type: "happy-subscriptions",
              id: "1",
            },
          },
        },
      },
      {
        id: "1",
        type: "happy-subscriptions",
        attributes: {},
      },
    ]);
  });
});
