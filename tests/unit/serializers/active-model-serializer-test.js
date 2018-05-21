import { Model, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';

import {module, test} from 'qunit';

module('Unit | Serializers | ActiveModelSerializer', function(hooks) {
  hooks.beforeEach(function() {
    let schema = new Schema(new Db(), {
      contact: Model.extend({
        address: belongsTo()
      }),
      address: Model.extend({
        contact: belongsTo()
      })
    });
    this.serializer = new ActiveModelSerializer({
      schema
    });
  });

  test('normalize works', function(assert) {
    let payload = {
      contact: {
        id: 1,
        name: 'Link'
      }
    };
    let jsonApiDoc = this.serializer.normalize(payload);

    assert.deepEqual(jsonApiDoc, {
      data: {
        type: 'contacts',
        id: 1,
        attributes: {
          name: 'Link'
        }
      }
    });
  });

  test('it hyphenates snake_cased words', function(assert) {
    let payload = {
      contact: {
        id: 1,
        first_name: 'Link'
      }
    };
    let jsonApiDoc = this.serializer.normalize(payload);

    assert.deepEqual(jsonApiDoc, {
      data: {
        type: 'contacts',
        id: 1,
        attributes: {
          'first-name': 'Link'
        }
      }
    });
  });

  test('it works without an id', function(assert) {
    let payload = {
      contact: {
        first_name: 'Link',
        last_name: 'zor'
      }
    };
    let jsonApiDoc = this.serializer.normalize(payload);

    assert.deepEqual(jsonApiDoc, {
      data: {
        type: 'contacts',
        attributes: {
          'first-name': 'Link',
          'last-name': 'zor'
        }
      }
    });
  });

  test('it returns coalesce Ids if present', function(assert) {
    let request = { url: '/authors', queryParams: { ids: ['1', '3'] } };
    assert.deepEqual(this.serializer.getCoalescedIds(request), ['1', '3']);
  });

  test('it returns undefined coalesce Ids if not present', function(assert) {
    let request = { url: '/authors', queryParams: {} };
    assert.strictEqual(this.serializer.getCoalescedIds(request), undefined);
  });

  test('normalize works with normalizeIds set to true', function(assert) {
    this.serializer.normalizeIds = true;
    let payload = {
      contact: {
        id: 1,
        name: 'Link',
        address: 1
      }
    };
    let jsonApiDoc = this.serializer.normalize(payload);

    assert.deepEqual(jsonApiDoc, {
      data: {
        type: 'contacts',
        id: 1,
        attributes: {
          name: 'Link'
        },
        relationships: {
          address: {
            data: {
              type: 'address',
              id: 1
            }
          }
        }
      }
    });
  });

  test('serializeIds defaults to "always"', function(assert) {
    let defaultState = new ActiveModelSerializer;
    assert.equal(defaultState.serializeIds, 'always');
  });
});
