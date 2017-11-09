import {module, test} from 'qunit';
import { Model, ActiveModelSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from '../../helpers/promise-ajax';

module('Integration | Server | Resource shorthand', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test',
      models: {
        contact: Model,
        blogPost: Model
      },
      serializers: {
        application: ActiveModelSerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('resource generates get shorthand for index action', function(assert) {
    assert.expect(2);
    let done = assert.async(1);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' },
        { id: 2, name: 'Zelda' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]
    });

    this.server.resource('contacts');

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      assert.deepEqual(response.data, { contacts: [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }] });
      done();
    });
  });

  test('resource generates get shorthand for show action', function(assert) {
    assert.expect(2);
    let done = assert.async(1);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' },
        { id: 2, name: 'Zelda' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]
    });

    this.server.resource('contacts');
    this.server.resource('blog-posts', { path: '/posts' });

    promiseAjax({
      method: 'GET',
      url: '/contacts/2'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      assert.deepEqual(response.data, { contact: { id: '2', name: 'Zelda' } });
      done();
    });
  });

  test('resource generates post shorthand', function(assert) {
    let { server } = this;
    assert.expect(2);
    let done = assert.async(1);

    server.resource('contacts');

    promiseAjax({
      method: 'POST',
      url: '/contacts',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).then((response) => {
      assert.equal(response.xhr.status, 201);
      assert.equal(server.db.contacts.length, 1);
      done();
    });
  });

  test('resource generates put shorthand', function(assert) {
    let { server } = this;
    assert.expect(2);
    let done = assert.async(1);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' }
      ]
    });

    server.resource('contacts');

    promiseAjax({
      method: 'PUT',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      assert.equal(server.db.contacts[0].name, 'Zelda');
      done();
    });
  });

  test('resource generates patch shorthand', function(assert) {
    let { server } = this;
    assert.expect(2);
    let done = assert.async(1);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' }
      ]
    });

    server.resource('contacts');

    promiseAjax({
      method: 'PATCH',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      assert.equal(server.db.contacts[0].name, 'Zelda');
      done();
    });
  });

  test('resource generates delete shorthand works', function(assert) {
    let { server } = this;
    assert.expect(2);
    let done = assert.async(1);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' }
      ]
    });

    server.resource('contacts');

    promiseAjax({
      method: 'DELETE',
      url: '/contacts/1'
    }).then((response) => {
      assert.equal(response.xhr.status, 204);
      assert.equal(server.db.contacts.length, 0);
      done();
    });
  });

  test('resource accepts a custom path for a resource', function(assert) {
    assert.expect(6);
    let done = assert.async(6);

    this.server.db.loadData({
      blogPosts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]
    });

    this.server.resource('blog-posts', { path: '/posts' });

    promiseAjax({
      method: 'GET',
      url: '/posts'
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });

    promiseAjax({
      method: 'GET',
      url: '/posts/2'
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });

    promiseAjax({
      method: 'POST',
      url: '/posts',
      data: JSON.stringify({
        blog_post: {
          name: 'Post 1'
        }
      })
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });

    promiseAjax({
      method: 'PUT',
      url: '/posts/1',
      data: JSON.stringify({
        blog_post: {
          name: 'Post 2'
        }
      })
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });

    promiseAjax({
      method: 'PATCH',
      url: '/posts/1',
      data: JSON.stringify({
        blog_post: {
          name: 'Post 2'
        }
      })
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });

    promiseAjax({
      method: 'DELETE',
      url: '/posts/1'
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });
  });

  test('resource accepts singular name', function(assert) {
    assert.expect(3);
    let done = assert.async(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' },
        { id: 2, name: 'Zelda' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]
    });

    this.server.resource('contact');
    this.server.resource('blog-post', { path: '/posts' });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      assert.deepEqual(response.data, { contacts: [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }] });
      done();
    });

    promiseAjax({
      method: 'GET',
      url: '/posts'
    }).catch((errors) => {
      assert.ok(false, 'failed to find custom path');
      done();
    }).then((response) => {
      assert.ok(true);
      done();
    });
  });

  test('resource does not accept both :all and :except options', function(assert) {
    let { server } = this;

    assert.throws(() => {
      server.resource('contacts', { only: ['index'], except: ['create'] });
    }, 'cannot use both :only and :except options');
  });

  test('resource generates shorthands which are whitelisted by :only option', function(assert) {
    let { server } = this;
    assert.expect(1);
    let done = assert.async(1);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' },
        { id: 2, name: 'Zelda' }
      ]
    });

    server.resource('contacts', { only: ['index'] });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      done();
    });
  });

  test('resource does not generate shorthands which are not whitelisted with :only option', function(assert) {
    let { server } = this;
    assert.expect(5);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.resource('contacts', { only: ['index'] });

    let doneForShow = assert.async();

    promiseAjax({
      method: 'GET',
      url: '/contacts/1'
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to GET '/contacts/1'") !== -1);
      doneForShow();
    });

    let doneForCreate = assert.async();

    promiseAjax({
      method: 'POST',
      url: '/contacts',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to POST '/contacts'") !== -1);
      doneForCreate();
    });

    let doneForPut = assert.async();

    promiseAjax({
      method: 'PUT',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to PUT '/contacts/1'") !== -1);
      doneForPut();
    });

    let doneForPatch = assert.async();

    promiseAjax({
      method: 'PATCH',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to PATCH '/contacts/1'") !== -1);
      doneForPatch();
    });

    let doneForDelete = assert.async();

    promiseAjax({
      method: 'DELETE',
      url: '/contacts/1'
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to DELETE '/contacts/1'") !== -1);
      doneForDelete();
    });
  });

  test('resource generates shorthands which are not blacklisted by :except option', function(assert) {
    let { server } = this;
    assert.expect(2);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.resource('contacts', { except: ['create', 'update', 'delete'] });

    let doneForIndex = assert.async();

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      doneForIndex();
    });

    let doneForShow = assert.async();

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      doneForShow();
    });
  });

  test('resource does not generate shorthands which are blacklisted by :except option', function(assert) {
    let { server } = this;
    assert.expect(4);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.resource('contacts', { except: ['create', 'update', 'delete'] });

    let doneForCreate = assert.async();

    promiseAjax({
      method: 'POST',
      url: '/contacts',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to POST '/contacts'") !== -1);
      doneForCreate();
    });

    let doneForPut = assert.async();

    promiseAjax({
      method: 'PUT',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to PUT '/contacts/1'") !== -1);
      doneForPut();
    });

    let doneForPatch = assert.async();

    promiseAjax({
      method: 'PATCH',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to PATCH '/contacts/1'") !== -1);
      doneForPatch();
    });

    let doneForDelete = assert.async();

    promiseAjax({
      method: 'DELETE',
      url: '/contacts/1'
    }).catch((errors) => {
      assert.ok(errors.error.message.indexOf("Mirage: Your Ember app tried to DELETE '/contacts/1'") !== -1);
      doneForDelete();
    });
  });
});
