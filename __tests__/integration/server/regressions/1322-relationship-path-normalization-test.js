
import { Model, hasMany, belongsTo, JSONAPISerializer } from "@miragejs/server";
import Server from "@lib/server";
import promiseAjax from "dummy/tests/helpers/promise-ajax";
import { underscore } from "@lib/utils/inflector";

describe(
  "Integration | Server | Regressions | 1322 Relationship Path Normalization Test",
  function() {
    beforeEach(function() {
      this.server = new Server({
        environment: "test",
        models: {
          happyUser: Model.extend({
            happyLicenses: hasMany(),
            happyAvatar: belongsTo()
          }),
          happyLicense: Model.extend({
            happyUser: belongsTo()
          }),
          happyAvatar: Model.extend({
            happyUser: belongsTo()
          })
        },
        serializers: {
          application: JSONAPISerializer.extend({
            keyForRelationship(relationshipName) {
              return underscore(relationshipName);
            }
          })
        },
        baseConfig() {
          this.resource("happy-licenses");
        }
      });
    });

    afterEach(function() {
      this.server.shutdown();
    });

    test("it works", async () => {
      let avatar1 = this.server.create("happy-avatar");
      let user1 = this.server.create("happy-user", { happyAvatar: avatar1 });
      this.server.create("happy-license", { happyUser: user1 });

      expect.assertions(2);

      let response = await promiseAjax({
        method: "GET",
        url: "/happy-licenses/1?include=happy_user.happy_avatar"
      });
      let json = response.data;

      expect(json.data).toEqual({
        attributes: {},
        id: "1",
        relationships: {
          happy_user: {
            data: {
              id: user1.id,
              type: "happy-users"
            }
          }
        },
        type: "happy-licenses"
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
                type: "happy-avatars"
              }
            }
          }
        },
        {
          id: avatar1.id,
          type: "happy-avatars",
          attributes: {}
        }
      ]);
    });
  }
);
