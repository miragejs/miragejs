import referenceSort from 'ember-cli-mirage/utils/reference-sort';
import {module, test} from 'qunit';

module('mirage:reference-sort');

test('it sorts property references', function(assert) {
  let sorted = referenceSort([
    ['propA'],
    ['propB', 'propC'],
    ['propC', 'propA'],
    ['propD']
  ]);

  assert.deepEqual(sorted, ['propD', 'propA', 'propC', 'propB']);
});

test('it throws on circular dependency', function(assert) {
  assert.throws(function() {
    referenceSort([
      ['propA', 'propB'],
      ['propB', 'propA']
    ]);
  }, function(e) {
    return e.toString() === 'Error: Cyclic dependency in properties ["propB","propA"]';
  });

});

test('it works with no references', function(assert) {
  let sorted = referenceSort([
    ['propA'],
    ['propB'],
    ['propC'],
    ['propD']
  ]);

  assert.deepEqual(sorted, ['propD', 'propC', 'propB', 'propA']);
});
