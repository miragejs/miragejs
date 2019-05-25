# Acceptance tests

Acceptance testing your Ember app involves verifying some user behavior. For example, you may want to test that the user can view a list of movies on your app's homepage.

Many of these tests rely on a given server state. In other words, you want to test that, _given ten movie resources exist on the server_ at the time the user boots up the app, when the user visits the homepage they see a list of 10 movies.

Mirage was originally built specifically for these sorts of high-level tests. Let's see how it works.

Assuming you're using Application Tests (introduced in [Ember 3.0](https://emberjs.com/blog/2018/02/14/ember-3-0-released.html#toc_updates-to-the-testing-defaults)), add the `setupMirage` hook to the top of your test file:

```diff
  import { setupApplicationTest } from 'ember-qunit';
+ import { setupMirage } from 'ember-cli-mirage/test-support';


  module('Acceptance | Homepage test', function(hooks) {
    setupApplicationTest(hooks);
+   setupMirage(hooks);

    test('my first test', async function(assert) {
      // test code
    });
  });
```

(Pre-3.0 style tests will automatically boot Mirage via an initializer.)

Now we can run your Ember app's test suite with `ember t -s`.

In the test environment, Mirage will load all your route handlers from `mirage/config.js`, but it will ignore your seed data from `mirage/scenarios/default.js`. That means each test starts off with a clean database state.

Within each test, you can use your factories to define your initial server state:

```js
test('I can view the movies', async function(assert) {
  this.server.createList('movie', 10);

  await visit('/');

  assert.dom('li.movie').exists({ count: 10 });
});
```

After each test, Mirage's server will be reset, so none of this state will leak across tests.


## Keeping your tests focused

Factories are important in keeping code that's relevant to a test as close to that test as possible. In the example above, we wanted to verify that the user would see ten movies, given those movies existed on the server. So, the `server.createList('movie', 10)` call was directly in the test.

Say we wanted to test that when the user visits a details route for a movie titled "Interstellar," they would see that title in an `<h1>` tag. One way to accomplish this would be to update the movie factory itself:

```js
// mirage/factories/movie.js
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: 'Interstellar'
});
```

The problem with this approach is that this change is very specific to this test.

Suppose another test needed to verify something different about movies with different titles. Changing the factory to suit that case would break this test.

For this reason, you should use `create` and `createList` to override specific attributes of your model. This will keep code relevant to your test near your test, without making the rest of your test suite brittle.

```js
test('I can view the movies', async function(assert) {
  this.server.createList('movie', 10);

  await visit('/');

  assert.dom('li.movie').exists({ count: 10 });
});

test("I see the movies's title on the detail route", await function(assert) {
  let movie = this.server.create('movie',
    title: 'Interstellar'
  });

  await visit(`/movies/${movie.id}`);

  assert.dom('h1').hasText('Interstellar');
});
```


## Arrange, Act, Assert

Mirage recommends using the [Arrange, Act, Assert approach](https://github.com/testdouble/contributing-tests/wiki/Arrange-Act-Assert) to write tests. You'll sometimes hear this pattern referred to as **AAA testing** ("triple-A testing").

You can see this structure in our test from above:

```js
test('I can view the movies', async function(assert) {
  // ARRANGE
  this.server.createList('movie', 10);

  // ACT
  await visit('/');

  // ASSERT
  assert.dom('li.movie').exists({ count: 10 });
});
```

There are of course times where it makes sense to break this rule (for example to add some extra assertions near the beginning or middle of a test), but in general you should strive to follow the pattern.




## Testing errors

To test how your Ember app responds to a server error, overwrite a route handler within a test:

```js
test('the user sees an error if the save attempt fails', async function(assert) {
   this.server.post('/questions', () => ({
     errors: [ 'The database went on vacation' ]
   }), 500);

   await visit('/');
   await click('.new');
   await fillIn('input', 'New question');
   await click('.save');

   assert.dom('h2').hasText('The database went on vacation');
});
```

This route handler definition is only in effect for the duration of this test, so as soon as it's over any handler you have defined for POST to `/questions` in your `config.js` file will be used again.


## Using scenarios in testing

Typically you should reserve the `scenarios/default.js` file for development, so changes to it don't affect the rest of your test suite. That's why Mirage doesn't autoload this module during tests.

If there's some logic you'd like to share between your development scenario and your tests, you can always make a new module under `scenarios` and import it in both places.

you'd like to load your development scenario in your tests, you can always directly import that module and run your test server through it:

Create the module

```js
// scenarios/shared.js
export default function(server) {
  server.loadFixtures('country');

  server.createList('event', 10);
});
```

...load it in your default scenario

```js
import sharedScenario from '../../mirage/scenarios/shared';

test('I can view the authors', async function(assert) {
  sharedScenario(server);

  await visit('/contacts');

  assert.dom('p').exists({ count: 3 });
});
```

...and then also load it in your tests (or even a common test setup function):

```js
import sharedScenario from '../../mirage/scenarios/shared';

test('I can view the authors', async function(assert) {
  sharedScenario(server);

  // ...
});
```

This same sort of pattern will work for Integration and Unit tests as well.

---

Those are the basics of Acceptance Testing with Mirage! Next let's talk about Integration and Unit tests.
