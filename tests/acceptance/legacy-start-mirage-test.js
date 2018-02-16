import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import ENV from 'dummy/config/environment';

module('Acceptance: Starting mirage (legacy)', function(hooks) {
  let app, oldEnv, addonConfig;

  hooks.beforeEach(function() {
    oldEnv = ENV['ember-cli-mirage'];
    ENV['ember-cli-mirage'] = addonConfig = {};
  });

  hooks.afterEach(function() {
    destroyApp(app);
    ENV['ember-cli-mirage'] = oldEnv;
  });

  test('The server starts automatically when configured with enabled undefined', async function(assert) {
    app = startApp();

    assert.ok(window.server, 'There is a server after starting');

    let contact = window.server.create('contact');
    await window.visit('/1');

    assert.equal(window.currentRouteName(), 'contact');
    assert.dom('p').hasText(`The contact is ${contact.name}`, 'The automatically started server works');
  });

  test('The server starts automatically when configured with { enabled: true }', async function(assert) {
    addonConfig.enabled = true;
    app = startApp();

    assert.ok(window.server, 'There is a server after starting');

    let contact = window.server.create('contact');
    await window.visit('/1');

    assert.equal(window.currentRouteName(), 'contact');
    assert.dom('p').hasText(`The contact is ${contact.name}`, 'The automatically started server works');
  });

  test('The server can be started manually when configured with { enabled: false }', async function(assert) {
    addonConfig.enabled = false;
    app = startApp();

    assert.equal(window.server, undefined, 'There is no server at first');
    startMirage();
    assert.ok(window.server, 'There is a server after starting');

    let contact = window.server.create('contact');
    await window.visit('/1');

    assert.equal(window.currentRouteName(), 'contact');
    assert.dom('p').hasText(`The contact is ${contact.name}`, 'The manually started server works');
  });
});
