import {module, test} from 'qunit';
import { Model, Factory } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Factory creation', {
  beforeEach() {
    this.Contact = Model.extend();
    this.AmazingContact = Model.extend();
    this.Post = Model.extend();

    this.server = new Server({
      environment: 'test',
      models: {
        contact: this.Contact,
        amazingContact: this.AmazingContact,
        post: this.Post
      },
      factories: {
        contact: Factory,
        amazingContact: Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('create returns a Model if one is defined', function(assert) {
  let contact = this.server.create('contact');

  assert.ok(contact instanceof this.Contact, 'expected a Contact');
});

test('createList returns Models if one is defined', function(assert) {
  let contacts = this.server.createList('contact', 1);

  assert.ok(contacts[0] instanceof this.Contact, 'expected a Contactl');
});

test('create returns a Model if one is defined, when using a compound name', function(assert) {
  let contact = this.server.create('amazing-contact');

  assert.ok(contact instanceof this.AmazingContact, 'expected an AmazingContact');
});

test('createList returns Models if one is defined, when using a compound name', function(assert) {
  let contacts = this.server.createList('amazing-contact', 1);

  assert.ok(contacts[0] instanceof this.AmazingContact, 'expected an AmazingContact');
});

test('create falls back to a model if no factory is defined', function(assert) {
  let post = this.server.create('post');

  assert.ok(post instanceof this.Post);
  assert.equal(post.id, 1);
});

test('createList falls back to a model if no factory is defined', function(assert) {
  let posts = this.server.createList('post', 2);

  assert.ok(posts[0] instanceof this.Post);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].id, 1);
});
