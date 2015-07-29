import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { camelize } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

schemaHelper.setup();

module('mirage:serializer - key formatting', {
  beforeEach() {
    let MySerializer = Serializer.extend({
      keyForAttribute(key) {
        return camelize(key);
      }
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`keyForAttribute formats the attributes of a model`, function(assert) {
  var user = schemaHelper.getUserModel({
    id: 1,
    'first-name': 'Link',
    'last-name': 'Jackson',
    age: 323,
  });

  let result = this.serializer.serialize(user);

  assert.deepEqual(result, {
    id: 1,
    firstName: 'Link',
    lastName: 'Jackson',
    age: 323
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  var user = schemaHelper.getUserCollection([
    {id: 1, 'first-name': 'Link', 'last-name': 'Jackson'},
    {id: 2, 'first-name': 'Zelda', 'last-name': 'Brown'}
  ]);

  let result = this.serializer.serialize(user);

  assert.deepEqual(result, [
    {id: 1, firstName: 'Link', lastName: 'Jackson'},
    {id: 2, firstName: 'Zelda', lastName: 'Brown'}
  ]);
});
