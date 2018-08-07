import { module, test } from 'qunit';
import { Model, hasMany, belongsTo, RestSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from '../../../helpers/promise-ajax';

module('Integration | Server | Shorthands | REST Serializer Sanity check', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test',
      models: {
        contact: Model.extend({
          addresses: hasMany()
        }),
        address: Model.extend({
          contact: belongsTo()
        })
      },
      serializers: {
        application: RestSerializer.extend({
          normalizeIds: true
        })
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('a get shorthand works', async function(assert) {
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    this.server.get('/contacts');

    let { xhr, data } = await promiseAjax({
      method: 'GET',
      url: '/contacts'
    });

    assert.equal(xhr.status, 200);
    assert.deepEqual(data, { contacts: [{ id: '1', name: 'Link', addresses: [] }] });
  });

  test('a post shorthand works', async function(assert) {
    let { server } = this;
    assert.expect(3);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.post('/addresses');

    let { xhr } = await promiseAjax({
      method: 'POST',
      url: '/addresses',
      data: JSON.stringify({
        address: {
          street: '5th ave',
          contact: 1
        }
      })
    });

    assert.equal(xhr.status, 201);
    assert.equal(server.db.addresses.length, 1);
    assert.equal(server.db.addresses[0].contactId, 1);
  });

  test('a put shorthand works', async function(assert) {
    let { server } = this;
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.put('/contacts/:id');

    let { xhr } = await promiseAjax({
      method: 'PUT',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    });

    assert.equal(xhr.status, 200);
    assert.equal(server.db.contacts[0].name, 'Zelda');
  });

  test('a patch shorthand works', async function(assert) {
    let { server } = this;
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.patch('/contacts/:id');

    let { xhr } = await promiseAjax({
      method: 'PATCH',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    });

    assert.equal(xhr.status, 200);
    assert.equal(server.db.contacts[0].name, 'Zelda');
  });

  test('a delete shorthand works', async function(assert) {
    let { server } = this;
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.del('/contacts/:id');

    let { xhr } = await promiseAjax({
      method: 'DELETE',
      url: '/contacts/1'
    });

    assert.equal(xhr.status, 204);
    assert.equal(server.db.contacts.length, 0);
  });
});
