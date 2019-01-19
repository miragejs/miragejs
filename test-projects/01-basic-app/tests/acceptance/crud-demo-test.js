import { test } from 'qunit';
import moduleForAcceptance from 'basic-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Crud demo');

test('I can view the users', function(assert) {
  server.createList('user', 3);

  visit('/crud-demo');

  andThen(function() {
    assert.equal(find('[data-test-id="user"]').length, 3);
  });
});

test('I can create a new user', function(assert) {
  server.create('user', 1);

  visit('/crud-demo');
  fillIn('input', 'Ganon');
  click('button:contains(Create)');

  andThen(function() {
    assert.equal(find('[data-test-id="user"]').length, 2);
    assert.ok(server.db.users.length, 2);
  });
});

test('I can update a user', function(assert) {
  let user = server.create('user', { name: 'Yehuda' });

  visit('/crud-demo');
  fillIn('[data-test-id="user"] input', 'Katz');
  click('button:contains(Save)');

  andThen(function() {
    user.reload();

    assert.equal(find('[data-test-id="user"] input').val(), 'Katz');
    assert.ok(user.name, 'Katz');
  });
});

test('I can delete a user', function(assert) {
  server.create('user', { name: 'Yehuda' });

  visit('/crud-demo');
  click('button:contains(Delete)');

  andThen(function() {
    assert.equal(find('[data-test-id="user"]').length, 0);
    assert.equal(server.db.users.length, 0);
  });
});

test('If the server errors on GET /users, the error template shows', function(assert) {
  server.get('/users', {
    errors: [ 'improper auth' ]
  }, 404);

  visit('/crud-demo');

  andThen(function() {
    assert.ok(find(':contains(improper auth)').length);
    assert.equal(currentRouteName(), 'crud-demo_error');
  });
});
