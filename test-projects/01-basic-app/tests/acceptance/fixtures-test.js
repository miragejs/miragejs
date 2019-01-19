import moduleForAcceptance from '../helpers/module-for-acceptance';
import { test } from 'qunit';

moduleForAcceptance('Acceptance | Fixtures');

test('I can use fixtures', async function(assert) {
  server.loadFixtures();

  await visit('/crud-demo');

  assert.equal(find('[data-test-id="user"]').length, 1);
});

test('I can use fixtures with the filename api', async function(assert) {
  server.loadFixtures('countries');

  await visit('/crud-demo');

  assert.equal(find('[data-test-id="user"]').length, 0);
});
