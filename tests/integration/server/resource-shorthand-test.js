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

  test('resource generates get shorthand for index action', async function(assert) {
    assert.expect(2);

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

    let { data, xhr } = await promiseAjax({
      method: 'GET',
      url: '/contacts'
    });

    assert.equal(xhr.status, 200);
    assert.deepEqual(data, { contacts: [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }] });
  });

  test('resource generates get shorthand for show action', async function(assert) {
    assert.expect(2);

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

    let { data, xhr } = await promiseAjax({
      method: 'GET',
      url: '/contacts/2'
    });

    assert.equal(xhr.status, 200);
    assert.deepEqual(data, { contact: { id: '2', name: 'Zelda' } });
  });

  test('resource generates post shorthand', async function(assert) {
    let { server } = this;
    assert.expect(2);

    server.resource('contacts');

    let { xhr } = await promiseAjax({
      method: 'POST',
      url: '/contacts',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    });

    assert.equal(xhr.status, 201);
    assert.equal(server.db.contacts.length, 1);
  });

  test('resource generates put shorthand', async function(assert) {
    let { server } = this;
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' }
      ]
    });

    server.resource('contacts');

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

  test('resource generates patch shorthand', async function(assert) {
    let { server } = this;
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' }
      ]
    });

    server.resource('contacts');

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

  test('resource generates delete shorthand works', async function(assert) {
    let { server } = this;
    assert.expect(2);

    this.server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ],
      blogPosts: [
        { id: 1, title: 'Post 1' }
      ]
    });

    server.resource('contacts');

    let { xhr } = await promiseAjax({
      method: 'DELETE',
      url: '/contacts/1'
    });

    assert.equal(xhr.status, 204);
    assert.equal(server.db.contacts.length, 0);
  });

  test('resource accepts a custom path for a resource', async function(assert) {
    assert.expect(6);

    this.server.db.loadData({
      blogPosts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]
    });

    this.server.resource('blog-posts', { path: '/posts' });

    let indexResponse = await promiseAjax({
      method: 'GET',
      url: '/posts'
    });
    assert.equal(indexResponse.xhr.status, 200, 'Should receive a 200 response from resource index action');

    let showResponse = await promiseAjax({
      method: 'GET',
      url: '/posts/2'
    });
    assert.equal(showResponse.xhr.status, 200, 'Should receive a 200 response from resource show action');

    let createResponse = await promiseAjax({
      method: 'POST',
      url: '/posts',
      data: JSON.stringify({
        blog_post: {
          name: 'Post 1'
        }
      })
    });
    assert.equal(createResponse.xhr.status, 201, 'Should receive 201 response from resource create action');

    let updatePutResponse = await promiseAjax({
      method: 'PUT',
      url: '/posts/1',
      data: JSON.stringify({
        blog_post: {
          name: 'Post 2'
        }
      })
    });
    assert.equal(updatePutResponse.xhr.status, 200, 'Should receive 200 response from resource update action with PUT');

    let updatePatchResponse = await promiseAjax({
      method: 'PATCH',
      url: '/posts/1',
      data: JSON.stringify({
        blog_post: {
          name: 'Post 2'
        }
      })
    });
    assert.equal(updatePatchResponse.xhr.status, 200, 'Should receive 200 response from resource update action with PATCH');

    let deleteResponse = await promiseAjax({
      method: 'DELETE',
      url: '/posts/1'
    });
    assert.equal(deleteResponse.xhr.status, 204, 'Should receive 204 response from the resource delete action');
  });

  test('resource accepts singular name', async function(assert) {
    assert.expect(4);

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

    let contactsResponse = await promiseAjax({
      method: 'GET',
      url: '/contacts'
    });

    assert.equal(contactsResponse.xhr.status, 200);
    assert.deepEqual(
      contactsResponse.data,
      { contacts: [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }] }
    );

    let postsResponse = await promiseAjax({
      method: 'GET',
      url: '/posts'
    });

    assert.equal(postsResponse.xhr.status, 200);
    assert.deepEqual(
      postsResponse.data,
      { blog_posts: [{ id: '1', title: 'Post 1' }, { id: '2', title: 'Post 2' }] }
    );
  });

  test('resource does not accept both :all and :except options', function(assert) {
    let { server } = this;

    assert.throws(() => {
      server.resource('contacts', { only: ['index'], except: ['create'] });
    }, 'cannot use both :only and :except options');
  });

  test('resource generates shorthands which are whitelisted by :only option', async function(assert) {
    let { server } = this;
    assert.expect(1);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' },
        { id: 2, name: 'Zelda' }
      ]
    });

    server.resource('contacts', { only: ['index'] });

    let { xhr } = await promiseAjax({
      method: 'GET',
      url: '/contacts'
    });

    assert.equal(xhr.status, 200);
  });

  test('resource does not generate shorthands which are not whitelisted with :only option', async function(assert) {
    let { server } = this;
    assert.expect(5);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.resource('contacts', { only: ['index'] });

    try {
      await promiseAjax({
        method: 'GET',
        url: '/contacts/1'
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to GET '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the show action'
      );
    }

    try {
      await promiseAjax({
        method: 'POST',
        url: '/contacts',
        data: JSON.stringify({
          contact: {
            name: 'Zelda'
          }
        })
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to POST '/contacts'") > -1,
        'Should receive an error from Mirage when requesting the create action'
      );
    }

    try {
      await promiseAjax({
        method: 'PUT',
        url: '/contacts/1',
        data: JSON.stringify({
          contact: {
            name: 'Zelda'
          }
        })
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to PUT '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the update action with PUT'
      );
    }

    try {
      await promiseAjax({
        method: 'PATCH',
        url: '/contacts/1',
        data: JSON.stringify({
          contact: {
            name: 'Zelda'
          }
        })
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to PATCH '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the update action with PATCH'
      );
    }

    try {
      await promiseAjax({
        method: 'DELETE',
        url: '/contacts/1'
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to DELETE '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the delet action'
      );
    }
  });

  test('resource generates shorthands which are not blacklisted by :except option', async function(assert) {
    let { server } = this;
    assert.expect(2);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.resource('contacts', { except: ['create', 'update', 'delete'] });

    let indexResponse = await promiseAjax({
      method: 'GET',
      url: '/contacts'
    });
    assert.equal(indexResponse.xhr.status, 200, 'Should receive a 200 response from resource index action');

    let showResponse = await promiseAjax({
      method: 'GET',
      url: '/contacts/1'
    });
    assert.equal(showResponse.xhr.status, 200, 'Should receive a 200 response from resource show action');
  });

  test('resource does not generate shorthands which are blacklisted by :except option', async function(assert) {
    let { server } = this;
    assert.expect(4);

    server.db.loadData({
      contacts: [
        { id: 1, name: 'Link' }
      ]
    });

    server.resource('contacts', { except: ['create', 'update', 'delete'] });

    try {
      await promiseAjax({
        method: 'POST',
        url: '/contacts',
        data: JSON.stringify({
          contact: {
            name: 'Zelda'
          }
        })
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to POST '/contacts'") > -1,
        'Should receive an error from Mirage when requesting the create action'
      );
    }

    try {
      await promiseAjax({
        method: 'PUT',
        url: '/contacts/1',
        data: JSON.stringify({
          contact: {
            name: 'Zelda'
          }
        })
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to PUT '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the update action with PUT'
      );
    }

    try {
      await promiseAjax({
        method: 'PATCH',
        url: '/contacts/1',
        data: JSON.stringify({
          contact: {
            name: 'Zelda'
          }
        })
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to PATCH '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the update action with PATCH'
      );
    }

    try {
      await promiseAjax({
        method: 'DELETE',
        url: '/contacts/1'
      });
    } catch(e) {
      assert.ok(
        e.error.message.indexOf("Mirage: Your Ember app tried to DELETE '/contacts/1'") > -1,
        'Should receive an error from Mirage when requesting the delet action'
      );
    }
  });
});
