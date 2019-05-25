# Overview

Mirage lets you simulate API responses by writing **route handlers**.

The simplest example of a route handler is a function that returns an object:

```js
// mirage/config.js
export default function() {
  this.namespace = 'api';

  this.get('/movies', () => {
    return {
      data: [
        { id: 1, type: 'movies', attributes: { name: 'Interstellar' } },
        { id: 2, type: 'movies', attributes: { name: 'Inception' } },
        { id: 3, type: 'movies', attributes: { name: 'Dunkirk' } },
      ]
    };
  });

}
```

Now whenever your Ember app makes a GET request to `/api/movies`, Mirage will respond with this data.

## Dynamic data

This works, and is a common way to simulate HTTP responses - but hard-coded responses like this have a few problems:

   - *They're inflexible*. What if you want to change the data for this route in your tests?
   - *They contain formatting logic*. Logic that's concerned with the shape of your JSON payload (e.g. the `data` and `attributes` keys) is now duplicated across all your route handlers.
   - *They're too basic.* Inevitably, when your Mirage server needs to deal with more complex things like relationships, these simple ad hoc responses start to break down.

Mirage provides a **data layer** that lets you write more powerful server implementations. Let's see how it works by replacing our basic stub data above.

### Creating a model

First, we'll need to tell Mirage that we have a dynamic `Movie` model.

If you're using Ember Data and you already have a `Movie` model defined, you can skip this step! Mirage will automatically generate its models from your Ember Data definitions, so you won't have any files in the `mirage/models` directory.

If you're not using Ember Data, you can use the `mirage-model` generator to create a model from the command line:

```bash
$ ember g mirage-model movie
```

This generates the following file:

```js
// mirage/models/movie.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({
});
```

### Writing a dynamic route handler

Models let our route handlers take advantage of Mirage's _in-memory database_. The database makes our route handlers dynamic, so we can change the data that's returned without having to rewrite the handler.

Let's update our route handler to be dynamic:

```js
this.get('/movies', (schema, request) => {
  return schema.movies.all();
});
```

The `schema` argument lets us access our new `Movie` model. This route will now respond with all the authors in Mirage's database at the time of the request. We can therefore change the data this route responds with by only changing what records are in Mirage's database, instead of having to write a different version of the handler for each scenario we want to simulate.


### Seeding the database

Right now, if we sent a request to our new handler above, the response would look something like this:

```js
// GET /api/movies
data: [
]
```

That's because Mirage's database is empty.

To actually seed our database with fake data, we'll use *factories*. Factories are objects that make it easy to generate realistic-looking data for your Mirage server. Think of them as blueprints for your models.

Let's create a factory for our author with

```sh
$ ember g mirage-factory movie
```

We can then define some properties on our Factory. They can be simple types like Booleans, Strings or Numbers, or functions that return dynamic data:

```js
// mirage/factories/movie.js
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  title(i) {
    return `Movie ${i}`; // Movie 1, Movie 2, etc.
  },

  year() {
    let min = 1950;
    let max = 2019;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  rating: "PG-13"

});
```

This factory creates objects like

```js
[
  {
    title: 'Movie 1',
    year: 1992,
    rating: "PG-13"
  },
  {
    title: 'Movie 2',
    year: 2008,
    rating: "PG-13"
  },
  // ...
]
```

and so on, which will automatically be inserted into the `movies` database table. The database will assign each record an `id`, and now we can interact with this data in our route handlers.

To actually use our new factory definition, we can call the `server.create` and `server.createList` methods.

To seed our development database, use the function in the `scenarios/default.js` file:

```js
// mirage/scenarios/default.js
export default function(server) {

  server.createList('movie', 10);

};
```

Now when our Ember app makes a GET request to `/api/movies` using the route handler above, we'll see something that looks like this:

```js
// GET /api/movies
data: [
  {
    id: 1,
    type: "movies",
    attributes: {
      title: "Movie 1",
      year: 1992,
      rating: "PG-13"
    }
  },
  {
    id: 2,
    type: "movies",
    attributes: {
      title: "Movie 2",
      year: 2008,
      rating: "PG-13"
    }
  },
  // ...
]
```

As we can see, this response is now influenced by the run-time state of our database.

In acceptance tests, `scenarios/default.js` is ignored, and instead you can use `this.server` to setup your database in the state needed for the test:

```js
// tests/acceptance/movies-test.js
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Homepage test', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test("I can view the movies", async function(assert) {
    this.server.createList("movie", 3);

    await visit("/home");

    assert.dom("[data-test-id='movie-row']").exists({ count: 3 });
  });
});
```

You can also pass attribute overrides directly to `create` or `createList`:

```js
test("I can view the movie title", async function(assert) {
  let movie = this.server.create('movie', { title: "Interstellar" });

  await visit(`/movies/${movie.id}`);

  assert.dom('h1').includesText("Interstellar");
});
```

You now have a simple way to set up your Mirage server's initial data, both during development and on a per-test basis.

## Associations

Dealing with associations is always tricky, and faking endpoints that deal with associations is no exception. Fortunately, Mirage ships with an ORM to help keep your route handlers clean.

Let's say your movie has many cast-members. You can declare this relationship in your model:

```js
// mirage/models/movie.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  castMembers: hasMany()
});

// mirage/models/cast-member.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  movie: belongsTo()
});
```

Now Mirage knows about the relationship between these two models, which can be useful when writing route handlers:

```js
this.get('/movies/:id/cast-members', (schema, request) => {
  let movie = schema.movies.find(request.params.id);

  return movie.castMembers;
});
```

and when creating graphs of related data:

```js
test("I can see a movie's cast members", async function(assert) {
  server.create('movie', {
    title: 'Interstellar',
    castMembers: [
      server.create('cast-member', { name: 'Matthew McConaughey' }),
      server.create('cast-member', { name: 'Anne Hathaway' }),
      server.create('cast-member', { name: 'Jessica Chastain' })
    ]
  });

  await visit('/');

  assert.dom('li.cast-member').exists({ count: 3 });
});
```

Mirage uses foreign keys to keep track of these related models for you, so you don't have to worry about any messy bookkeeping details while your Ember app reads and writes new relationships to Mirage's database.


## Serializers

Mirage is designed for you to be able to completely replicate your production server.

So far, we've seen that Mirage's default payloads are formatted using the [JSON:API](https://jsonapi.org) spec. This spec produces payloads that look like this:

```js
// GET /movies/1
{
  data: {
    id: 1,
    type: 'movies',
    attributes: {
      title: 'Interstellar'
    }
  }
}
```

New Ember apps using Ember Data work well with the JSON:API format, but of course, not every backend uses JSON:API.

For example, your API responses might look more like this:

```js
// GET /movies/1
{
  movies: {
    id: 1,
    title: 'Interstellar'
  }
}
```

This is why Mirage _serializers_ exist. Serializers let you customize the formatting logic of your responses, without having to change your route handlers, models, relationships, or any other part of your Mirage setup.

Mirage ships with a few named serializers that match popular backend formats. You can also extend from the base class and use formatting hooks to match your own backend:

```js
// mirage/serializers/application.js
import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  keyForAttribute(attr) {
    return dasherize(attr);
  },

  keyForRelationship(attr) {
    return dasherize(attr);
  }
});
```

Mirage's serializer layer is also aware of your relationships, which helps when faking endpoints that sideload or embed related data:

```js
// mirage/serializers/movie.js
import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  include: [ 'crewMembers' ]
});

// mirage/config.js
export default function() {
  this.get('/movies/:id', (schema, request) => {
    return schema.movies.find(request.params.id);
  });
}
```

With the above config, a GET to `/movies/1` would return automatically include related crew members:

```js
{
  movie: {
    id: 1,
    title: 'Interstellar'
  },
  'crew-members': [
    {
      id: 1,
      'movie-id': 1,
      name: 'Matthew McConaughey'
    },
    {
      id: 1,
      'movie-id': 1,
      name: 'Anne Hathaway'
    },
    ...
  ]
}
```

Mirage ships with two named serializers, JSONAPISerializer and ActiveModelSerializer, to save you the trouble of writing this custom code yourself. See the [serializer guide](../api/modules/ember-cli-mirage/serializer~Serializer) to learn more.

## Shorthands

Mirage has *shorthands* to reduce the code needed for conventional API routes. For example, the route handler

```js
this.get('/authors', (schema, request) => {
  return schema.authors.all();
});
```

can be written as

```js
this.get('/authors');
```

There are also shorthands for `post`, `patch` (or `put`), and `del` methods. Here's a full set of resourceful routes for an `author` resource:

```js
this.get('/authors');
this.get('/authors/:id');
this.post('/authors');
this.patch('/authors/:id');
this.del('/authors/:id');
```

Shorthands make writing your server definition concise, so use them whenever possible. When mocking a new route, you should always start with a Shorthand, and then drop down to a function route handler when you need more control.


## Passthrough

Mirage is a great tool to use even if you're working on an existing app, or if you don't want to fake your entire API. By default, Mirage throws an error if your Ember app makes a request that doesn't have a corresponding route handler defined. To avoid this, tell Mirage to let unhandled requests pass through:

```js
// mirage/config.js
this.passthrough();
```

Now you can develop as you normally would, for example against an existing API.

When it comes time to build a new feature, you don't have to wait for the API to be updated. Just define the new route that you need

```js
// mirage/config.js
this.get('/comments');

this.passthrough();
```

and you can fully develop and test the feature. In this way you can build up your fake server piece by piece - adding some solid acceptance tests along the way.

---

That should be enough to get you started!

The rest of the docs are organized by Mirage's higher-level concepts:

  - **Route handlers** contain the logic around what run-time data Mirage uses to respond to requests.

  - The **Data layer** is how Mirage stores and tracks changes to your data over time.

Keep reading to learn more!
