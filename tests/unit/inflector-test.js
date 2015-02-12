import { singularize, pluralize } from 'ember-pretenderify/inflector';

QUnit.module('pretenderify:inflector');

QUnit.test('can singularize', function(assert) {
  assert.equal(singularize('tests'), 'test');
  assert.equal(singularize('watches'), 'watch');
  assert.equal(singularize('sheep'), 'sheep');
});

QUnit.test('can pluralize', function(assert) {
  assert.equal(pluralize('test'), 'tests');
  assert.equal(pluralize('watch'), 'watches');
  assert.equal(pluralize('sheep'), 'sheep');
});
