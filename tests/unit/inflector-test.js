import { singularize, pluralize } from 'ember-cli-mirage/utils/inflector';

import {module, test} from 'qunit';

module('Unit | Inflector');

test('can singularize', function(assert) {
  assert.equal(singularize('tests'), 'test');
  assert.equal(singularize('watches'), 'watch');
  assert.equal(singularize('sheep'), 'sheep');
});

test('can pluralize', function(assert) {
  assert.equal(pluralize('test'), 'tests');
  assert.equal(pluralize('watch'), 'watches');
  assert.equal(pluralize('sheep'), 'sheep');
});
