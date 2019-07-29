
import { Model, hasMany, belongsTo, JSONAPISerializer } from "@miragejs/server";
import Server from "@lib/server";
import promiseAjax from "dummy/tests/helpers/promise-ajax";

describe("Integration | Server | Regressions | 1318 Linkage bug test", function(
  
) {
  beforeEach(function() {
    this.server = new Server({
      environment: "test",
      models: {
        happyUser: Model.extend({
          happyLicenses: hasMany()
        }),
        happyLicense: Model.extend({
          happyUser: belongsTo(),
          happySubscription: belongsTo()
        }),
        happySubscription: Model.extend({
          happyLicenses: hasMany()
        })
      },
      serializers: {
        application: JSONAPISerializer
      },
      baseConfig() {
        this.resource("happy-users");
      }
    });
  });

  afterEach(function() {
    this.server.shutdown();
  });

  test("it works", async () => {
    let happySubscription = this.server.create("happy-subscription");

    let user1 = this.server.create("happy-user");
    this.server.create("happy-license", {
      happyUser: user1,
      happySubscription
    });

    let user2 = this.server.create("happy-user");
    this.server.create("happy-license", {
      happyUser: user2,
      happySubscription
    });

    expect.assertions(1);

    let response = await promiseAjax({
      method: "GET",
      url: "/happy-users/1?include=happy-licenses.happy-subscription"
    });
    let json = response.data;

    expect(json.included).toEqual([
      {
        id: "1",
        type: "happy-licenses",
        attributes: {},
        relationships: {
          "happy-subscription": {
            data: {
              type: "happy-subscriptions",
              id: "1"
            }
          }
        }
      },
      {
        id: "1",
        type: "happy-subscriptions",
        attributes: {}
      }
    ]);
  });
});
