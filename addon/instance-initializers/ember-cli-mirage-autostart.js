import EmberObject from '@ember/object';
import getRfc232TestContext from 'ember-cli-mirage/get-rfc232-test-context';
import startMirage from 'ember-cli-mirage/start-mirage';

// An object we can register with the container to ensure that mirage is shut
// down when the application is destroyed
const MirageShutdown = EmberObject.extend({
  testContext: null,

  willDestroy() {
    let testContext = this.get('testContext');
    testContext.server.shutdown();
    delete testContext.server;
  }
});

/**
  If we are running an rfc232/rfc268 test then we want to support the
  `autostart` configuration option, which auto-starts mirage before the test
  runs and shuts it down afterwards, and also sets `this.server` on the test
  context so the tests don't need to use the global `server`. We do this in an
  instance initializer because initializers only run once per test run, not
  before and after each test.

  @hide
*/
export function initialize(appInstance) {
  let testContext = getRfc232TestContext();
  if (testContext) {
    let {
      'ember-cli-mirage': { autostart } = {}
    } = appInstance.resolveRegistration('config:environment');

    if (autostart) {
      let server = startMirage(appInstance);
      testContext.server = server;

      // To ensure that the server is shut down when the application is
      // destroyed, register and create a singleton object that shuts the server
      // down in its willDestroy() hook.
      appInstance.register('mirage:shutdown', MirageShutdown);
      let shutdown = appInstance.lookup('mirage:shutdown');
      shutdown.set('testContext', testContext);
    }
  }
}

export default {
  initialize
};
