import { module, test } from 'qunit';

import { Model, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import FunctionRouteHandler from 'ember-cli-mirage/route-handlers/function';

module('Integration | Route handlers | Assertions', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'development',
      models: {
        user: Model.extend({
        }),
        comment: Model.extend({
        })
      },
      serializers: {
        application: JSONAPISerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.server.post('/users');
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('a helpful assert is thrown if a relationship passed in a request is not a defined association on the posted model', async function(assert) {
    assert.expect(1);

    let request = {
      requestHeaders: {},
      method: 'POST',
      url: '/users',
      requestBody: JSON.stringify({
        data: {
          type: 'user',
          attributes: {
            name: 'Jacob Dylan'
          },
          relationships: {
            'comments': {
              data: {
                type: 'comment',
                name: 'Bob Dylan'
              }
            }
          }
        }
      })
    };

    this.functionHandler = new FunctionRouteHandler(this.server.schema, this.server.serializerOrRegistry);
    this.functionHandler.path = '/users';
    this.functionHandler.request = request;

    assert.throws(function() {
      this.functionHandler.normalizedRequestAttrs();
    }, /You're passing the relationship 'comments' to the 'user' model via a POST to '\/users', but you did not define the 'comments' association on the 'user' model./);
  });
});
