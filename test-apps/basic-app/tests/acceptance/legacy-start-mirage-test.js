import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { startMirage } from 'basic-app/initializers/ember-cli-mirage';
import ENV from 'basic-app/config/environment';

module('Acceptance | Starting mirage (legacy)', function(hooks) {
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

    window.server.create('user');
    await window.visit('/crud-demo');

    assert.equal(window.currentRouteName(), 'crud-demo');
    assert.dom('[data-test-id="user"]').exists();
  });

  test('The server starts automatically when configured with { enabled: true }', async function(assert) {
    addonConfig.enabled = true;
    app = startApp();

    assert.ok(window.server, 'There is a server after starting');

    window.server.create('user');
    await window.visit('/crud-demo');

    assert.equal(window.currentRouteName(), 'crud-demo');
    assert.dom('[data-test-id="user"]').exists();
  });

  test('The server can be started manually when configured with { enabled: false }', async function(assert) {
    addonConfig.enabled = false;
    app = startApp();

    assert.equal(window.server, undefined, 'There is no server at first');
    startMirage();
    assert.ok(window.server, 'There is a server after starting');

    window.server.create('user');
    await window.visit('/crud-demo');

    assert.equal(window.currentRouteName(), 'crud-demo');
    assert.dom('[data-test-id="user"]').exists();
  });
});
