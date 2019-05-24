import { module, test } from 'qunit';
import { Promise } from 'rsvp';
import { Model, ActiveModelSerializer, Response } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from '../../../helpers/promise-ajax';

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
    this.server.get('/users', function() {
      throw 'I goofed';
    });

    assert.rejects(
      promiseAjax({ method: 'GET', url: '/users' }),
      function(ajaxError) {
        let text = ajaxError.xhr.responseText;
        let line1 = text.indexOf(`Mirage: Your GET handler for the url /users threw an error`) > 0;
        let line2 = text.indexOf(`I goofed`) > 0;

        return line1 && line2;
      }
    );
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
    assert.expect(4);

    this.server.get('/users', function() {
      return new Promise(resolve => {
        resolve(new Response(200, { 'Content-Type': 'text/csv' }, ''));
      });
    });

    let { data, xhr } = await promiseAjax({ method: 'GET', url: '/users' });

    assert.deepEqual(data, '');
    assert.equal(xhr.responseText, "");
    assert.equal(xhr.status, 200);
    assert.equal(xhr.getAllResponseHeaders().trim(), "Content-Type: text/csv");
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
});
