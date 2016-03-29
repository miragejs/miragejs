import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import ENV from 'dummy/config/environment';

let App;

module('Acceptance: Manually starting Mirage', {
  beforeEach() {
    ENV['ember-cli-mirage'] = { enabled: false };
    App = startApp();
  },

  afterEach() {
    server.shutdown();
    Ember.run(App, 'destroy');
    ENV['ember-cli-mirage'].enabled = undefined;
  }
});

test('The server can be started manually when configured with { enabled: false }', function(assert) {
  assert.equal(window.server, undefined, 'There is no server at first');
  startMirage();
  assert.ok(window.server, 'There is a server after starting');

  let contact = server.create('contact');
  visit('/1');

  andThen(function() {
    assert.equal(currentRouteName(), 'contact');
    assert.equal(find('p:first').text(), `The contact is ${contact.name}`, 'The manually started server works');
  });
});
