# Functions

Function handlers are the most flexible way to write route handlers in Mirage.

To define new function handlers, use the `get`, `post`, `patch` (or `put`) and `del` methods. Here's an example:

```js
// mirage/config.js
this.get('/movies', () => {
  return [ 'Interstellar', 'Inception', 'Dunkirk' ];
});
```

Now when your Ember app makes a GET request to `/movies`, it will receive this data.

Each verb method has the same signature. The first argument is the path (URL) and the second is the actual function handler that returns the response.

```js
this.get('/movies', () => { ... });
this.post('/movies', () => { ... });
this.patch('/movies/:id', () => { ... });
this.del('/movies/:id', () => { ... });
```


## Timing

The last argument to a route handler is an options object you can use to adjust the timing. Use this to delay the response of a particular route and see how your Ember app behaves when communicating with a slow network.

```js
// mirage/config.js
this.get('/movies', () => {
  return [ 'Interstellar', 'Inception', 'Dunkirk' ];
}, { timing: 4000 });
```

The default delay is 50ms during development, and 0 during testing (so your tests run fast).

You can also set a global timing parameter for all routes. Individual timing parameters override the global setting.

```js
// mirage/config.js
export default function() {
  this.namespace = 'api';
  this.timing = 2000;

  this.get('/movies', () => {
    return [ 'Interstellar', 'Inception', 'Dunkirk' ];
  });

  this.get('/complex-query', () => {
    return [1, 2, 3, 4, 5];
  }, { timing: 3000 });
}
```

If you want to add delays to a test, you can override the timing for individual tests by putting the timing parameter in your test

```js
test('this route works with a delay', function() {
  server.timing = 10000;

  // ...
});
```

Because the server is reset after each test, this option won't leak into the rest of your suite.


## Accessing the data layer

Route handlers receive `schema` as their first parameter, which lets them access Mirage's data layer:

```js
this.get('/movies', (schema) => {
  return schema.movies.all();
});
```

Most of your route handlers will interact with the data layer in some way.

The second parameter is the `request` object, which contains information about the request your Ember app made. For example, you can access dynamic URL segments from it:

```js
this.get('/movies/:id', (schema, request) => {
  let id = request.params.id;

  return schema.movies.find(id);
});
```

You can also access the request body, for example to handle a POST or PATCH request that contains data sent over by the Ember app:

```js
this.post('/movies', (schema, request) => {
  let title = JSON.parse(request.requestBody).title;

  return schema.movies.create({ title });
});
```

The `normalizedRequestAttrs` helper (documented below) provides some sugar for working with the request data.


## Dynamic paths and query params

The request object that's injected into your route handlers contains any dynamic route segments and query params.

To define a route that has a dynamic segment, use colon syntax (`:segment`) in your path. The dynamic piece will be available via `request.params.[segment]`:

```js
this.get('/authors/:id', (schema, request) => {
  let id = request.params.id;

  return schema.authors.find(id);
})
```

Query params from the request can also be accessed via `request.queryParams.[param]`.


## Helpers

There are several helpers available when writing function route handlers.

### serialize

This helper returns the JSON for the given Model or Collection after passing it through the Serializer layer. It's useful if you want to do some final munging on the serialized JSON before returning it.

```js
this.get('/movies', (schema) => {
  let movies = schema.movies.all();
  let json = this.serialize(movies);

  json.meta = { page: 1 };

  return json;
});
```

By default this method uses the named serializer for the given Model or Collection. You can pass in a specific serializer name as the second argument:

```js
this.get('/movies', (schema) => {
  let movies = schema.movies.all();
  let json = this.serialize(movies, 'sparse-movie');

  json.meta = { page: 1 };

  return json;
});
```

### normalizedRequestAttrs

This helper returns the body of a request in a normalized form, suitable for working with and creating records.

For example, if your Ember app makes a POST request with this data

```js
// POST /users

{
  data: {
    type: 'users',
    attributes: {
      'first-name': 'Conan',
      'middle-name': 'the',
      'last-name': 'Barbarian'
    },
    relationships: {
      team: {
        data: {
          type: 'teams',
          id: 1
        }
      }
    }
  }
}
```

then `normalizedRequestAttrs()` could be used like this

```js
this.post('/users', function(schema, request) {
  let attrs = this.normalizedRequestAttrs();
  /*
    attrs = {
      firstName: 'Conan',
      middleName: 'the',
      lastName: 'Barbarian',
      teamId: '1'
    }
  */
  return schema.users.create(attrs);
});
```

Note that attribute keys were camelCased, and the `team` foreign key was extracted. This is because a `user` owns the `team` foreign key; if another relationship were included in the request but the `user` did not own its foreign key, it would not have been extracted.

This helper method leverages your serializer's `normalize` method. In the example above, it's assumed that the app was using the `JSONAPISerializer`, which comes with the `#normalize` method already written. If you're not using one of the bundled serializers, you'll need to implement `#normalize` and have it return a JSON:API document to take advantage of this method.

Additionally, you'll need to use a full `function` here, as opposed to an ES6 arrow function (e.g `() => { ... }`). This is because `normalizedRequestAttrs` requires the `this` context from the function handler, and an arrow function would bind this from the outer scope.

`normalizedRequestAttrs()` relies on a `modelName` to work and attempts to automatically detect it based on the URL of the request. If you use conventional URLs – for example, PATCH /users/1 – the helper should work. If you are using something custom – for example, PATCH /users/edit/1 – you’ll need to provide the `modelName` to the helper as the first argument:

```js
this.patch('/users/edit/:id', function(schema, request) {
  let attrs = this.normalizedRequestAttrs('user');
  // ...
});
```


## Status codes and headers

By default, Mirage sets the HTTP status code of a response based on the verb being used for the route:

  - GET is 200
  - PATCH/PUT is 204
  - POST is 201
  - DEL is 204

PATCH/PUT and POST change to 200 if there is a response body.

Additionally, a header for `Content-Type` is set to `application/json`.

You can customize both the response code and headers by returning an instance of the `Response` class in your route handler:

```js
// mirage/config.js
import { Response } from 'ember-cli-mirage';

export default function() {
  this.post('/authors', function(schema, request) {
    let attrs = JSON.parse(request.requestBody).author;

    if (attrs.name) {
      return schema.authors.create(attrs);
    } else {
      return new Response(400, { some: 'header' }, { errors: ['name cannot be blank'] });
    }
  });
}
```


## External origins

You can use Mirage to simulate other-origin requests. By default, a route like

```js
this.get('/contacts', ...)
```

will hit the same origin that's serving your Ember app. To handle a different origin, use a fully qualified domain name:

```js
this.get('http://api.twitter.com/v1', ...)
```

If your entire Ember app uses an external (other-origin) API, you can globally configure the domain via `urlPrefix`:

```js
// mirage/config.js
this.urlPrefix = 'https://my.api.com';

// This route will handle requests to https://my.api.com/contacts
this.get('/contacts', ...)
```

---

That's it on writing low-level function route handlers!

Function route handlers are flexible, but also cumbersome to write out for every endpoint. If you're working with an API that's conventional enough, hopefully you'll be writing fewer function route handlers and more Shorthands, which we'll discuss in the next section.
