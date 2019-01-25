# Acceptance testing

Acceptance testing your Ember app typically involves verifying some user behavior. For example, you may want to test that the user can view the photos on your app's index route.

Many of these tests rely on a given server state. In other words, you want to test that the user can view ten photos, *given that ten photo resources exist on the server* at the time the user boots up the app.

If you're using Application Tests (introduced in [Ember 3.0](https://emberjs.com/blog/2018/02/14/ember-3-0-released.html#toc_updates-to-the-testing-defaults)), add the `setupMirage` hook to the top of your test file:

```diff
  import { setupApplicationTest } from 'ember-qunit';
+ import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

  module('Acceptance | Homepage test', function(hooks) {
    setupApplicationTest(hooks);
+   setupMirage(hooks);
  
    test('my first test', async function(assert) {
      // test code
    });
  });
```

Once you've defined your routes, use the `server` variable to define the initial server state directly in your tests:

```js
test('I can view the photos', assert => {
  server.createList('photo', 10);

  visit('/');

  andThen(function() {
    assert.equal( find('img').length, 10 );
  });
});
```

`server.createList` uses the `photo` factory to generate 10 database records. This way, Mirage's database is populated when the Ember app boots and makes an AJAX request to fetch the photos data.

Mirage's server will be reset after each test, so each test starts out with a clean database state.

## Keeping your tests focused

The purpose of factories is to put code that's relevant to a test as close to that test as possible. In the example above, we wanted to verify that the user would see ten photos, given those photos existed on the server. So, the `server.createList('photo', 10)` call was directly in the test.

Say we wanted to test that when the user visits a details route for a photo titled "Sunset over Hyrule," they would see that title in an `<h1>` tag. One way to accomplish this would be to update the photo factory itself:

```js
// mirage/factories/photo.js
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: 'Sunset over Hyrule'
});
```

The problem with this approach is that the desired change is very specific to this test. Suppose another test wanted to verify photos with different titles were displayed. Changing the factory to suit that case would break this test.

For this reason, `create` and `createList` allow you to override specific attributes that your factory has defined. This lets us keep relevant code near our tests, without making them brittle.

To override attributes, simply pass in an object as the last argument to `create` or `createList` with the attributes you want to override. Here's what this may look like for the photos example.

First, let's make our factory more generic:

```js
// mirage/factories/photo.js
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title(i) {
    // Photo 1, Photo 2 etc.
    return `Photo ${i}`;
  }
});
```

Now, we can write our tests, overriding the factory-generated attributes where appropriate:

```js
test("I can view the photos", assert => {
  server.createList('photo', 10);

  visit('/');

  andThen(() => {
    assert.equal( find('img').length, 10 );
  });
});

test("I see the photo's title on a detail route", assert => {
  let photo = server.create('photo', {title: 'Sunset over Hyrule'});

  visit('/' + photo.id);

  andThen(() => {
    assert.equal( find('h1:contains(Sunset over Hyrule)').length, 1 );
  });
});
```

We override `title` in the second test since it's relevant there, but we stick with the factory-generated defaults for the first test.

## Asserting a server call was made in a test

Often you'll write tests against your application's UI, which will verify that the proper data from Mirage was returned. However, because Mirage gives you a full client-side server, you can gain more confidence from your tests by asserting against Mirage's server state, in addition to testing your Ember app's UI.

There are two general approaches to this. First, you can assert directly against Mirage's database:

```js
test("I can change the lesson's title", assert => {
  server.create('lesson', {title: 'My First Lesson'})

  visit('/');
  click('.Edit')
  fillIn('input', 'Updated lesson');
  click('.Save');

  andThen(() => {
    // Assert against our app's UI
    assert.equal( find('h1:contains(Updated lesson)').length, 1 );

    // Also check that the data was "persisted" to our backend
    assert.equal( server.db.lessons[0].title, 'Updated lesson');
  });
});
```

The next strategy is to temporarily override the server route that's relevant to your test, and assert against the actual request that your Ember app sent:

```js
test("I can change the lesson's title", function(assert) {
  assert.expect(1);
  let done = assert.async();

  server.create('lesson', {title: 'My First Lesson'})

  server.put('/lessons/:id', (schema, request) => {
    let params = JSON.parse(request.requestBody);

    // Here, we're asserting the params Mirage received are in the format you expect
    assert.deepEqual(params, {...});
    done();
  });

  visit('/');
  click('.Edit')
  fillIn('input', 'Updated lesson');
  click('.Save');
});
```

Note that here, we're overwriting any route handler you may defined for PUT to `/lessons/:id` in your `config.js` file, but only for this test. After this test, your Mirage server will be reset, and all the routes from `config.js` will be used.

## Testing errors

To test how your Ember app responds to a server error, overwrite a route handler within a test:

```js
test('the user sees an error if the save attempt fails', function(assert) {
   server.post('/questions', {errors: ['There was an error']}, 500);

   visit('/');
   click('.new');
   fillIn('input', 'New question');
   click('.save');

   andThen(() => {
     assert.equals(find('p:contains(There was an error)').length, 1);
   });
});
```

This route handler definition is only in effect for the duration of this test, so as soon as it's over any handler you have defined for POST to `/questions` in your `config.js` file will be used again.

---

You should now know enough to fake your production API and test your app using Mirage!
