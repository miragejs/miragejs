import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import { module, test } from 'qunit';

module('Unit | Serializers | JSON API Serializer', function(hooks) {
  hooks.beforeEach(function() {
    this.serializer = new JSONAPISerializer();
  });

  test('it returns coalesce Ids if present', function(assert) {
    let request = { url: '/authors', queryParams: { 'filter[id]': '1,3' } };
    assert.deepEqual(this.serializer.getCoalescedIds(request), ['1', '3']);
  });

  test('it returns undefined coalesce Ids if not present', function(assert) {
    let request = { url: '/authors', queryParams: {} };
    assert.strictEqual(this.serializer.getCoalescedIds(request), undefined);
  });
});
