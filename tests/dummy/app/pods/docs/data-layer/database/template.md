# The Database

At the core of Mirage's data layer is a simple in-memory database. This database stores all of Mirage's initial state, and then your route handlers access and modify that state as you use your application.

The database is what allows Mirage to mimic a production server, giving you the ability to write complete dynamic features in your Ember app.

Most of your Mirage code will not access the database directly, but rather will interact with it through Mirage's ORM. We'll cover the ORM in the next section of these guides.

However, it's good to know that whether or not you use the ORM, you can always interact with the database directly.

For example, you could seed it with some data in `scenarios/default.js`

```js
// scenarios/default.js
export default function(server) {
  server.db.loadData({
    movies: [
      { title: 'Interstellar' },
      { title: 'Inception' },
      { title: 'Dunkirk' },
    ]
  });
}
```

and then can access it in your route handlers using the `schema` argument:

```js
this.get('/movies', (schema, request) => {
  return schema.db.movies;
});
```

This route handler would then respond with the data you loaded:

```js
[
  { id: '1', title: 'Interstellar' },
  { id: '2', title: 'Inception' },
  { id: '3', title: 'Dunkirk' }
]
```

Note that each record has an `id` field, since the database assigns all new records an auto-incrementing ID.

The most common place you'll use the database directly is in your tests, where you can access it via `this.server.db`. It can be useful to assert against the state of Mirage's database to verify that your Ember app's network requests are sending over the correct data.

```js
// tests/movie-test.js
test('I can create a movie', async function(assert) {
  await visit('/movies/new');
  await fillIn('.title', 'The Dark Knight');
  await click('.submit');

  assert.dom('h2').includesText('New movie saved!');
  assert.equal(this.server.db.movies[0].title, 'The Dark Knight');
});
```

You can view the rest of the Database APIs in the {{docs-link 'Db' 'docs.api.item' 'modules/ember-cli-mirage/db-collection~DbCollection'}} and {{docs-link 'DbCollection' 'docs.api.item' 'modules/ember-cli-mirage/db~Db'}} API reference.

Next, we'll learn about Mirage's ORM.
