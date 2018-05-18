import { module, test } from 'qunit';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from 'dummy/tests/helpers/promise-ajax';

module('Integration | Server | Regressions | 1318 Linkage bug test', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test',
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
        this.resource('happy-users');
      }
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it works', async function(assert) {
    let happySubscription = this.server.create('happy-subscription');

    let user1 = this.server.create('happy-user');
    this.server.create('happy-license', { happyUser: user1, happySubscription });

    let user2 = this.server.create('happy-user');
    this.server.create('happy-license', { happyUser: user2, happySubscription });

    assert.expect(1);

    let response = await promiseAjax({
      method: 'GET',
      url: '/happy-users/1?include=happy-licenses.happy-subscription'
    });
    let json = response.data;

    assert.deepEqual(json.included, [
      {
        id: '1',
        type: 'happy-licenses',
        attributes: {},
        relationships: {
          'happy-subscription': {
            data: {
              type: 'happy-subscriptions',
              id: '1'
            }
          }
        }
      },
      {
        id: '1',
        type: 'happy-subscriptions',
        attributes: {}
      }
    ]);
  });

});
