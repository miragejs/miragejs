# Assertions

Most of your tests will assert against your Ember app's UI. After visiting a route and interacting with the app, and after Mirage handles any requests, you'll assert that your UI is in the state you expect it to be.

But sometimes even if your UI looks consistent, your app may have a bug on account of sending the wrong data to your server.

To address this class of issues, you can assert against the state of your Mirage server within your tests, right alongside your UI assertions. This will give you more confidence that your Ember app is sending over the correct data to your backend.


## Asserting against Mirage's database

The simplest way to assert that your Ember app is sending over the correct data to your backend is to assert against Mirage's database. If the correct data makes it there, you'll have confidence not only that the JSON payloads from your Ember app are correct, but that your Mirage route handlers are behaving as you expect.

Here's an example:

```js
test("I can change the lesson's title", async function(assert) {
  this.server.create('lesson', { title: 'My First Lesson' })

  await visit('/');
  await click('.Edit')
  await fillIn('input', 'Updated lesson');
  await click('.Save');

  // Assert against our app's UI
  assert.dom('h1').hasText('Updated lesson');

  // Also check that the data was "persisted" to our backend
  assert.equal(this.server.db.lessons[0].title, 'Updated lesson');
});
```

This is a great way to gain some extra confidence that your Ember app is sending over the data you expect.


## Asserting against Mirage Models

It can also be useful to assert against Mirage's ORM models, to verify things like updates to your model's relationships:

```js
test('I can add a tag to a post', async function(assert) {
  let programming = this.server.create('tag', { name: 'Programming' });
  let post = this.server.create('post');

  await visit(`/posts/${post.id}/edit`);
  await select('.tags', 'Programming');
  await click('.save');

  assert.dom().includesText('Saved!');
  assert.equal(post.reload().tagIds.includes(programming.id));
});
```

The `reload` method on Mirage models will rehydrate them with any new database data since they were instantiated, allowing you to verify that your route handler logic worked as expected.

Asserting against models is basically another way to verify Mirage's database data is correct.


## Asserting against handled requests and responses

You can also assert against the actual HTTP requests and responses that are made during your test.

To do this, first enable [Pretender's `trackedRequests` feature](https://github.com/pretenderjs/pretender#tracking-requests) by enabling the `trackRequests` environment option:

```js
// config/environment.js
module.exports = function(environment) {
  if (environment === 'test') {
    ENV['ember-cli-mirage'] = {
      trackRequests: true
    };
  }
}
```

This feature is disabled by default to avoid memory issues during long development sessions.

Now Mirage will track every request (along with the associated response) and make them available to you via `server.pretender.handledRequests`. That way you can assert against requests in that array at the end of your test.

```js
test("I can filter the table", async function(assert) {
  this.server.createList('movie', 5, { genre: 'Sci-Fi' });
  this.server.createList('movie', 3, { genre: 'Drama' });

  await visit('/');
  await select('.genre', 'Sci-Fi');

  // Assert against our app's UI
  assert.dom('tr').exists({ count: 5 });

  // Also assert against the HTTP request count & query
  let requests = server.pretender.handledRequests;
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].queryParams, { 'filter[genre]': 'Sci-Fi' });
});
```

In general we recommend asserting against Mirage's database and your UI, as the specifics of your app's HTTP requests should be considered implementation details of the behavior you're actually interested in verifying. But there's certainly valid reasons to drop down and assert against HTTP data.



---

And with that, you've completed the main portion of the guides! Read on to see some advanced use cases and configuration options, or head over to the API docs to see how to use Mirage's various classes.
