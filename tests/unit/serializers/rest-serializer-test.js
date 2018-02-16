import RestSerializer from 'ember-cli-mirage/serializers/rest-serializer';

import { module, test } from 'qunit';

module('Unit | Serializers | RestSerializer', function(hooks) {
  hooks.beforeEach(function() {
    this.serializer = new RestSerializer();
  });

  test('it hyphenates camelized words', function(assert) {
    let payload = {
      'person': {
        'id': 1,
        'firstName': 'Rick',
        'lastName': 'Sanchez'
      }
    };
    let jsonApiDoc = this.serializer.normalize(payload);

    assert.deepEqual(jsonApiDoc, {
      data: {
        type: 'people',
        id: 1,
        attributes: {
          'first-name': 'Rick',
          'last-name': 'Sanchez'
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
});
