import Ember from 'ember';
import {module as qunitModule, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import {visit, currentRouteName} from '@ember/test-helpers';
import startMirage from 'ember-cli-mirage/start-mirage';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import ENV from 'dummy/config/environment';

let module;
if (Ember.VERSION === '1.13.13') {
  module = () => null;
} else {
  module = qunitModule;
}

module('Acceptance: Starting mirage', function(hooks) {
  let oldEnv, addonConfig, dynamicAfterEach;

  hooks.beforeEach(function() {
    oldEnv = ENV['ember-cli-mirage'];
    ENV['ember-cli-mirage'] = addonConfig = {};
    // When running in non-legacy mode we shoud ignore this, so we set it so we
    // can make sure that tests that it doesn't cause the server to start when
    // it shouldn't in the cases that test that
    addonConfig.enabled = true;

    dynamicAfterEach = () => undefined;
  });

  hooks.afterEach(function() {
    dynamicAfterEach();
  });

  hooks.afterEach(function() {
    ENV['ember-cli-mirage'] = oldEnv;
  });

  module('without autostart', function(hooks) {
    setupTest(hooks);

    test('it does not autostart but can be started manually', async function(assert) {
      assert.equal(window.server, undefined, 'There is no global server at first');
      let server = startMirage(this.owner);
      assert.ok(server, 'There is a server after starting');
      assert.ok(window.server, 'There is a global server after starting');
      dynamicAfterEach = () => server.shutdown();

      let contact = server.create('contact');
      await visit('/1');

      assert.equal(currentRouteName(), 'contact');
      assert.dom('p').hasText(`The contact is ${contact.name}`, 'The manually started server works');
    });

    module('setupMirage()', function(hooks) {
      setupMirage(hooks);

      test('it works', async function(assert) {
        assert.ok(this.server, 'There is a server');
        assert.ok(window.server, 'There is a global server');
        dynamicAfterEach = () => {
          assert.notOk(this.server, 'The server was shut down');
          assert.notOk(window.server, 'The global server is gone');
        };

        let contact = this.server.create('contact');
        await visit('/1');

        assert.equal(currentRouteName(), 'contact');
        assert.dom('p').hasText(`The contact is ${contact.name}`, 'The manually started server works');
      });
    });
  });

  module('with autostart', function(hooks) {
    hooks.beforeEach(function() {
      addonConfig.autostart = true;
    });

    setupTest(hooks);

    test('it autostarts', async function(assert) {
      assert.ok(this.server, 'There is a server');
      assert.ok(window.server, 'There is a global server');
      dynamicAfterEach = () => {
        assert.notOk(this.server, 'The server was shut down');
        assert.notOk(window.server, 'The global server is gone');
      };

      let contact = this.server.create('contact');
      await visit('/1');

      assert.equal(currentRouteName(), 'contact');
      assert.dom('p').hasText(`The contact is ${contact.name}`, 'The manually started server works');
    });
  });
});
