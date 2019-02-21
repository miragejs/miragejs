import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Faker', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it works', function(assert) {
    let user = this.server.create('user');

    assert.equal(user.age, 32);
  });

});
