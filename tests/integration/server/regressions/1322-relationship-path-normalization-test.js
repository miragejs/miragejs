import { module, test } from "qunit";
import { Model, hasMany, belongsTo, JSONAPISerializer } from "ember-cli-mirage";
import Server from "ember-cli-mirage/server";
import promiseAjax from "dummy/tests/helpers/promise-ajax";
import { underscore } from "ember-cli-mirage/utils/inflector";

module(
  "Integration | Server | Regressions | 1322 Relationship Path Normalization Test",
  function(hooks) {
    hooks.beforeEach(function() {
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

    hooks.afterEach(function() {
      this.server.shutdown();
    });

    test("it works", async function(assert) {
      let avatar1 = this.server.create("happy-avatar");
      let user1 = this.server.create("happy-user", { happyAvatar: avatar1 });
      this.server.create("happy-license", { happyUser: user1 });

      assert.expect(2);

      let response = await promiseAjax({
        method: "GET",
        url: "/happy-licenses/1?include=happy_user.happy_avatar"
      });
      let json = response.data;

      assert.deepEqual(json.data, {
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
      assert.deepEqual(json.included, [
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
