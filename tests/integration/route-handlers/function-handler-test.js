import { module, test } from 'qunit';
import { Model, Collection, Serializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import Response from 'ember-cli-mirage/response';
import FunctionRouteHandler from 'ember-cli-mirage/route-handlers/function';
import _uniq from 'lodash/array/uniq';

module('Integration | Route handlers | Function handler', {
  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        user: Model.extend({
        })
      },
      serializers: {
        sparseUser: Serializer.extend({
          attrs: ['id', 'name', 'tall']
        })
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.functionHandler = new FunctionRouteHandler(this.server.schema, this.server.serializerOrRegistry);
    this.schema = this.server.schema;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('mirage response string is not serialized to string', function(assert) {
  assert.expect(1);
  let done = assert.async();

  this.server.get('/users', function() {
    return new Response(200, { 'Content-Type': 'text/csv' }, 'firstname,lastname\nbob,dylon');
  });

  $.ajax({ method: 'GET', url: '/users' }).done(function(res) {
    assert.equal(res, 'firstname,lastname\nbob,dylon');
    done();
  });
});

test('#serialize uses the default serializer on a model', function(assert) {
  this.schema.users.create({ name: 'Sam' });

  let user = this.schema.users.first();
  let json = this.functionHandler.serialize(user);

  assert.deepEqual(json, {
    user: {
      id: '1',
      name: 'Sam'
    }
  });
});

test('#serialize uses the default serializer on a collection', function(assert) {
  this.schema.users.create({ name: 'Sam' });

  let users = this.schema.users.all();
  let json = this.functionHandler.serialize(users);

  assert.deepEqual(json, {
    users: [
      { id: '1', name: 'Sam' }
    ]
  });
});

test('#serialize takes an optional serializer type', function(assert) {
  this.schema.users.create({ name: 'Sam', tall: true, evil: false });
  this.schema.users.create({ name: 'Ganondorf', tall: true, evil: true });

  let users = this.schema.users.all();
  let json = this.functionHandler.serialize(users, 'sparse-user');

  assert.deepEqual(json, {
    users: [
      { id: '1', name: 'Sam', tall: true },
      { id: '2', name: 'Ganondorf', tall: true }
    ]
  });
});

test('#serialize throws an error when trying to specify a serializer that doesnt exist', function(assert) {
  this.schema.users.create({ name: 'Sam' });

  let users = this.schema.users.all();

  assert.throws(function() {
    this.functionHandler.serialize(users, 'foo-user');
  }, /that serializer doesn't exist/);
});

test('#serialize noops on plain JS arrays', function(assert) {
  this.server.schema.users.create({ name: 'Sam' });
  this.server.schema.users.create({ name: 'Sam' });
  this.server.schema.users.create({ name: 'Ganondorf' });

  let users = this.schema.users.all().models;
  let uniqueNames = _uniq(users, u => u.name);
  let serializedResponse = this.functionHandler.serialize(uniqueNames);

  assert.deepEqual(serializedResponse, uniqueNames);
});

test('#serialize on a Collection takes an optional serializer type', function(assert) {
  this.server.schema.users.create({ name: 'Sam', tall: true, evil: false });
  this.server.schema.users.create({ name: 'Sam', tall: true, evil: false });
  this.server.schema.users.create({ name: 'Ganondorf', tall: true, evil: true });

  let users = this.schema.users.all().models;
  let uniqueNames = _uniq(users, u => u.name);
  let collection = new Collection('user', uniqueNames);
  let json = this.functionHandler.serialize(collection, 'sparse-user');

  assert.deepEqual(json, {
    users: [
      { id: '1', name: 'Sam', tall: true },
      { id: '3', name: 'Ganondorf', tall: true }
    ]
  });
});
