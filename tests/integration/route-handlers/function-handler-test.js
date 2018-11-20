import { module, test } from 'qunit';
import { Promise } from 'rsvp';

import { Model, Collection, ActiveModelSerializer, Response } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import _uniqBy from 'lodash/uniqBy';
import promiseAjax from '../../helpers/promise-ajax';

module('Integration | Route handlers | Function handler', function(hooks) {
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

  test('a meaningful error is thrown if a custom route handler throws an error', async function(assert) {
    assert.expect(1);

    this.server.get('/users', function() {
      throw 'I goofed';
    });

    try {
      await promiseAjax({
        method: 'GET',
        url: '/users'
      });
    } catch(e) {
      assert.equal(
        e.xhr.responseText,
        'Mirage: Your GET handler for the url /users threw an error: I goofed'
      );
    }
  });

  test('mirage response string is not serialized to string', async function(assert) {
    assert.expect(1);

    this.server.get('/users', function() {
      return new Response(200, { 'Content-Type': 'text/csv' }, 'firstname,lastname\nbob,dylon');
    });

    let { data } = await promiseAjax({ method: 'GET', url: '/users' });
    assert.equal(data, 'firstname,lastname\nbob,dylon');
  });

  test('it can return a promise with non-serializable content', async function(assert) {
    assert.expect(1);

    this.server.get('/users', function() {
      return new Promise(resolve => {
        resolve(new Response(200, { 'Content-Type': 'text/csv' }, 'firstname,lastname\nbob,dylan'));
      });
    });

    let { data } = await promiseAjax({ method: 'GET', url: '/users' });
    assert.equal(data, 'firstname,lastname\nbob,dylan');
  });

  test('it can return a promise with serializable content', async function(assert) {
    assert.expect(1);

    let user = this.server.create('user', { name: 'Sam' });

    this.server.get('/users', function(schema) {
      return new Promise(resolve => {
        resolve(schema.users.all());
      });
    });

    let { data } = await promiseAjax({ method: 'GET', url: '/users' });
    assert.deepEqual(data, { users: [ { id: user.id, name: 'Sam' } ] });
  });

  test('it can return a promise with an empty string', async function(assert) {
    assert.expect(1);

    this.server.get('/users', function() {
      return new Promise(resolve => {
        resolve(new Response(200, { 'Content-Type': 'text/csv' }, ''));
      });
    });

    let { data } = await promiseAjax({ method: 'GET', url: '/users' });
    assert.equal(data, '');
  });

  test(`it can serialize a POJA of models`, async function(assert) {
    assert.expect(1);

    this.server.createList('user', 3);
    this.server.get('/users', (schema) => {
      return schema.users.all().models;
    });

    let { data } = await promiseAjax({
      method: 'GET',
      url: '/users'
    });

    assert.deepEqual(data, [{ id: '1' }, { id: '2' }, { id: '3' }]);
  });

  test('#serialize uses the default serializer on a model', async function(assert) {
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

  test('#serialize uses the default serializer on a collection', async function(assert) {
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

  test('#serialize takes an optional serializer type', async function(assert) {
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

  test('#serialize throws an error when trying to specify a serializer that doesnt exist', async function(assert) {
    assert.expect(1);

    this.server.create('user', { name: 'Sam' });

    this.server.get('/users', function(schema) {
      let users = schema.users.all();

      assert.throws(() => {
        this.serialize(users, 'foo-user');
      }, /that serializer doesn't exist/);
    });

    await promiseAjax({ method: 'GET', url: '/users' });
  });

  test('#serialize noops on plain JS arrays', async function(assert) {
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

  test('#serialize on a Collection takes an optional serializer type', async function(assert) {
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

  test(`#normalizedRequestAttrs returns an object with the primary resource's attrs and belongsTo keys camelized`, async function(assert) {
    assert.expect(1);

    this.server.post('/users', function() {
      let attrs = this.normalizedRequestAttrs();

      assert.deepEqual(attrs, {
        firstName: 'Sam',
        lastName: 'Selikoff',
        teamId: 1
      });

      return {};
    });

    await promiseAjax({
      method: 'POST',
      url: '/users',
      contentType: 'application/json',
      data: JSON.stringify({
        user: {
          first_name: 'Sam',
          last_name: 'Selikoff',
          team_id: 1
        }
      })
    });
  });

  test(`#normalizedRequestAttrs shows a meaningful error message if it cannot infer the modelname from the URL`, async function(assert) {
    assert.expect(1);

    this.server.post('/users/create', function() {
      assert.throws(() => {
        this.normalizedRequestAttrs();
      }, /the detected model of 'create' does not exist/);

      return {};
    });

    await promiseAjax({
      method: 'POST',
      url: '/users/create',
      contentType: 'application/json',
      data: JSON.stringify({
        user: {
          first_name: 'Sam',
          last_name: 'Selikoff',
          team_id: 1
        }
      })
    });
  });

  test(`#normalizedRequestAttrs accepts an optional modelName if it cannot be inferred from the path `, async function(assert) {
    assert.expect(1);

    this.server.post('/users/create', function() {
      let attrs = this.normalizedRequestAttrs('user');

      assert.deepEqual(attrs, {
        firstName: 'Sam',
        lastName: 'Selikoff',
        teamId: 1
      });

      return {};
    });

    await promiseAjax({
      method: 'POST',
      url: '/users/create',
      contentType: 'application/json',
      data: JSON.stringify({
        user: {
          first_name: 'Sam',
          last_name: 'Selikoff',
          team_id: 1
        }
      })
    });
  });

  test(`#normalizedRequestAttrs parses a x-www-form-urlencoded request and returns a POJO`, async function(assert) {
    assert.expect(1);

    this.server.post('/form-test', function() {
      let attrs = this.normalizedRequestAttrs();

      assert.deepEqual(attrs, {
        name: 'Sam Selikoff',
        company: 'TED',
        email: 'sam.selikoff@gmail.com'
      }, '#normalizedRequestAttrs successfully returned the parsed x-www-form-urlencoded request body');

      return {};
    });

    await promiseAjax({
      method: 'POST',
      url: '/form-test',
      data: 'name=Sam+Selikoff&company=TED&email=sam.selikoff@gmail.com'
    });
  });
});
