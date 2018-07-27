import startMirage from 'ember-cli-mirage/start-mirage';
import { settled } from '@ember/test-helpers';

//
// Used to set up mirage for a test. Must be called after one of the
// `ember-qunit` `setup*Test()` methods. It starts the server and sets
// `this.server` to point to it, and shuts the server down when the test
// finishes.
//
// NOTE: the `hooks = self` is for mocha support
//
export default function setupMirage(hooks = self) {
  hooks.beforeEach(function() {
    if (!this.owner) {
      throw new Error('You must call one of the ember-qunit setupTest(),'
        + ' setupRenderingTest() or setupApplicationTest() methods before'
        + ' calling setupMirage()');
    }

    this.server = startMirage(this.owner);
  });

  hooks.afterEach(function() {
    return settled().then(() => {
      if (this.server) {
        this.server.shutdown();
        delete this.server;
      }
    });
  });
}
