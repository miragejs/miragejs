import { getWithDefault } from '@ember/object';
import readModules from 'ember-cli-mirage/utils/read-modules';
import Server from 'ember-cli-mirage/server';
import _assign from 'lodash/assign';

/**
  Helper to start mirage. This should not be called directly. In rfc232/rfc268
  tests, use `setupMirage()` or the `autoboot` option in the addon config
  in the environment. In legacy tests that call `startMirage` directly, this
  should be called via the `startMirage` method exported from
  `<app>/initializers/ember-cli-mirage`.

  This is intended to be called with only the `owner` argument (which would be
  `this.owner` in an rfc232/rfc268 test, or the application instance if called
  from an instance initializer). However, to support the legacy initializer, it
  can instead accept a hash of the environment and config objects.

  @hide
*/
export default function startMirage(owner, { env, baseConfig, testConfig } = {}) {
  if (!env || !baseConfig) {
    if (!owner) {
      throw new Error('You must pass `owner` to startMirage()');
    }

    env = env || resolveRegistration(owner, 'config:environment');
    // These are set from `<app>/initializers/ember-cli-mirage`
    baseConfig = baseConfig || resolveRegistration(owner, 'mirage:base-config');
    testConfig = testConfig || resolveRegistration(owner, 'mirage:test-config');
  }

  let environment = env.environment;
  let discoverEmberDataModels = getWithDefault(env['ember-cli-mirage'] || {}, 'discoverEmberDataModels', true);
  let modules = readModules(env.modulePrefix);
  let options = _assign(modules, {environment, baseConfig, testConfig, discoverEmberDataModels});
  options.trackRequests = env['ember-cli-mirage'].trackRequests;

  return new Server(options);
}

// Support Ember 1.13
function resolveRegistration(owner, ...args) {
  if (owner.resolveRegistration) {
    return owner.resolveRegistration(...args);
  } else if (owner.__container__) {
    return owner.__container__.lookupFactory(...args);
  } else {
    return owner.container.lookupFactory(...args);
  }
}
