import Model from 'ember-cli-mirage/orm/model';
import {module, test} from 'qunit';

module('Unit | Model');

test('it can be instantiated', function(assert) {
  let model = new Model({}, 'user');
  assert.ok(model);
});

test('it cannot be instantiated without a schema', function(assert) {
  assert.throws(function() {
    new Model();
  }, /requires a schema/);
});

test('it cannot be instantiated without a modelName', function(assert) {
  assert.throws(function() {
    new Model({});
  }, /requires a modelName/);
});

test('findBelongsToAssociation returns association for given type if defined', function(assert) {
  let ModelClass = Model.extend();
  let authorAssociationMock = {};
  ModelClass.prototype.belongsToAssociations = {
    author: authorAssociationMock
  };

  assert.equal(ModelClass.findBelongsToAssociation('article'), null);
  assert.deepEqual(ModelClass.findBelongsToAssociation('author'), authorAssociationMock);
});
