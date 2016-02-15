import {module, test} from 'qunit';
import { Model, Factory } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Model creation', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'test',
      models: {
        contact: Model
      },
      factories: {
        contact: Factory
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
  assert.ok(contact instanceof Model, 'expected a model');
});

test('createList returns Models if one is defined', function(assert) {
  let contacts = this.server.createList('contact', 1);
  assert.ok(contacts[0] instanceof Model, 'expected a model');
});
