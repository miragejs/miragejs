import { test } from 'qunit';
import {
  Factory,
  Response,
  faker,
  Model,
  Serializer,
  ActiveModelSerializer,
  JSONAPISerializer,
  hasMany,
  belongsTo
} from 'ember-cli-mirage';

test('Factory is present in named exports from ember-cli-mirage', function(assert) {
  assert.ok(Factory);
});

test('Response is present in named exports from ember-cli-mirage', function(assert) {
  assert.ok(Response);
});

test('faker is present in named exports from ember-cli-mirage', function(assert) {
  assert.ok(faker);
});

test('Model is present in named exports from ember-cli-mirage', function(assert) {
  assert.ok(Model);
});

test('serializers are present in named exports from ember-cli-mirage', function(assert) {
  assert.ok(ActiveModelSerializer);
  assert.ok(JSONAPISerializer);
  assert.ok(Serializer);
});

test('relationship helpers are present in named exports from ember-cli-mirage', function(assert) {
  assert.ok(hasMany);
  assert.ok(belongsTo);
});
