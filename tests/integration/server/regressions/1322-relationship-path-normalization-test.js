import { module, test } from 'qunit';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from 'dummy/tests/helpers/promise-ajax';

module('Integration | Server | Regressions | 1322 Relationship Path Normalization Test', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test',
      models: {
        happyUser: Model.extend({
          happyLicenses: hasMany()
        }),
        happyLicense: Model.extend({
          happyUser: belongsTo()
        })
      },
      serializers: {
        application: JSONAPISerializer.extend({
          keyForRelationship(relationshipName) {
            if (relationshipName === 'happyUser') {
              return 'happy_user';
            } else {
              return JSONAPISerializer.prototype.keyForRelationship.apply(this, arguments);
            }
          }
        })
      },
      baseConfig() {
        this.resource('happy-licenses');
      }
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it works', async function(assert) {
    let user1 = this.server.create('happy-user');
    this.server.create('happy-license', { happyUser: user1 });

    assert.expect(2);

    let response = await promiseAjax({
      method: 'GET',
      url: '/happy-licenses/1?include=happy_user'
    });
    let json = response.data;

    assert.deepEqual(json.data, {
      attributes: {},
      id: "1",
      relationships: {
        "happy_user": {
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
        type: 'happy-users',
        attributes: {}
      }
    ]);
  });

});
