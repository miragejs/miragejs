import { module, test } from 'qunit';
import { Model, Collection, ActiveModelSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import _uniqBy from 'lodash/uniqBy';
import promiseAjax from '../../../helpers/promise-ajax';

module('Integration | Route handlers | Function handler | #serialize', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'development',
      models: {
        user: Model.extend({
        })
      },
      serializers: {
        application: ActiveModelSerializer,
        sparseUser: ActiveModelSerializer.extend({
          attrs: ['id', 'name', 'tall']
        })
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it uses the default serializer on a model', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam' });

    this.server.get('/users', function(schema) {
      let user = this.schema.users.first();
      let json = this.serialize(user);

      assert.deepEqual(json, {
        user: {
          id: '1',
          name: 'Sam'
        }
      });

      return true;
    });

    await promiseAjax({ method: 'GET', url: '/users' });
  });

  test('it uses the default serializer on a collection', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam' });

    this.server.get('/users', function(schema) {
      let users = this.schema.users.all();
      let json = this.serialize(users);

      assert.deepEqual(json, {
        users: [
          { id: '1', name: 'Sam' }
        ]
      });

      return true;
    });

    await promiseAjax({ method: 'GET', url: '/users' });
  });

  test('it takes an optional serializer type', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam', tall: true, evil: false });
    this.server.create('user', { name: 'Ganondorf', tall: true, evil: true });

    this.server.get('/users', function(schema) {
      let users = schema.users.all();
      let json = this.serialize(users, 'sparse-user');

      assert.deepEqual(json, {
        users: [
          { id: '1', name: 'Sam', tall: true },
          { id: '2', name: 'Ganondorf', tall: true }
        ]
      });

      return true;
    });

    await promiseAjax({ method: 'GET', url: '/users' });
  });

  test('it throws an error when trying to specify a serializer that doesnt exist', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam' });
    this.server.get('/users', function(schema) {
      let users = schema.users.all();

      this.serialize(users, 'foo-user');
    });

    assert.rejects(
      promiseAjax({ method: 'GET', url: '/users' }),
      function(ajaxError) {
        return ajaxError.xhr.responseText.indexOf(`that serializer doesn't exist`) > 0;
      }
    );
  });

  test('it noops on plain JS arrays', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam' });
    this.server.create('user', { name: 'Ganondorf' });

    this.server.get('/users', function(schema) {
      let names = schema.users.all().models.map(user => user.name);
      let json = this.serialize(names);

      assert.deepEqual(json, names);
    });

    await promiseAjax({ method: 'GET', url: '/users' });
  });

  test('it can take an optional serializer type on a Collection', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam', tall: true, evil: false });
    this.server.create('user', { name: 'Sam', tall: true, evil: false });
    this.server.create('user', { name: 'Ganondorf', tall: true, evil: true });

    this.server.get('/users', function(schema) {
      let users = schema.users.all().models;
      let uniqueNames = _uniqBy(users, 'name');
      let collection = new Collection('user', uniqueNames);
      let json = this.serialize(collection, 'sparse-user');

      assert.deepEqual(json, {
        users: [
          { id: '1', name: 'Sam', tall: true },
          { id: '3', name: 'Ganondorf', tall: true }
        ]
      });
    });

    await promiseAjax({ method: 'GET', url: '/users' });
  });
});
