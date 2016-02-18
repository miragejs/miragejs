import {module, test} from 'qunit';
import { Model, Factory } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Model creation', {
  beforeEach: function() {
    this.Contact = Model.extend();
    this.AmazingContact = Model.extend();
    this.server = new Server({
      environment: 'test',
      models: {
        contact: this.Contact,
        amazingContact: this.AmazingContact
      },
      factories: {
        contact: Factory,
        amazingContact: Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
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
