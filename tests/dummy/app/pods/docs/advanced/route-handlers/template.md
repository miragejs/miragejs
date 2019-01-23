# Route handlers

You define route handlers using the verb methods (`get`, `post`, `put`/`patch`, and `del`). All handlers have the following signature:

```js
this.verb(path, handler[, responseCode, options={}]);
```

There are three types of route handlers: [shorthand](#shorthands), [object](#object-handler), and [function](#function-handler).

The status code for all three types defaults to the following, based on the verb being used for the route:

  - GET is 200
  - PUT/PATCH is 204
  - POST is 201
  - DEL is 204

PUT/PATCH and POST change to 200 if there is a response body.

The optional `options` hash passed as the last parameter has `timing` and `coalesce` options.

<a name="timing" href="#timing">#</a> options.<b>timing</b>

Set the timing parameter of the response for this particular route. Default is a 400ms delay during development and 0 delay in testing (so your tests run fast).

Note you can set a [global timing parameter](/docs/api/modules/ember-cli-mirage/server~Server#timing) for all routes. Individual timing parameters override the global setting.

Example:

```js
this.post('/users', { timing: 1500 });

this.get('/complex_query', () => {
  return [1, 2, 3, 4, 5];
}, { timing: 3000 });
```

If you want to add delays to a particular test's routes, you can override the timing for individual tests by putting the timing parameter in your test

```js
test('Call this route with a delay', function() {
  server.timing = 10000;
  // ...
});
```

Or for all tests in a particular module

```js
module('Add delayed route calls to multiple tests', function() {
  server.timing = 10000;

  test('It slowly calls a route', function() {
    // ...
  });

  test ('It slow calls another route', function() {
    // ...
  });
});
```

Because the server is restarted after each test, you don't have to worry about this leaking into other tests.


<a name="coalesce" href="#coalesce">#</a> options.<b>coalesce</b>

This option only affects the [*Array of Objects* version of the GET shorthand](../shorthands/#get-shorthands). It is ignored by all other route handlers.


## Shorthands

```js
this.verb(path, shorthand[, responseCode]);
```

*shorthand* can either be a string, an array, or `undefined`, depending on which shorthand you're using. View [the reference](../shorthands) for all available shorthands.

Examples:

```js
this.get('/api/authors');
this.put('/api/authors/:id');
this.del('/posts/:id');
```

## Object handler

```js
this.verb(path, object[, responseCode]);
```

*object* is a POJO that's returned for this route.

Example:

```js
this.get('/api/authors/current', {id: 1, name: 'Link'});
this.get('/some/secret', {message: 'unauthorized'}, 404);
```

## Function handler

Write a custom function to handle this route.

```js
this.verb(path, (schema, request) => {
  // your code
}[, responseCode]);
```

The function handler you define takes two parameters, **schema** (your Mirage server's ORM) and **request** (the Pretender request object). Consult [the schema's API](../schema) for how to interact with your models (or the database directly) and [Pretender's docs](https://github.com/trek/pretender) for more info on the request object.

If the data returned from your handler is a JavaScript object or array, it will be stringified and sent as the response body of your request:

```js
this.get('/api/events', () => {
  let events = [];

  for (var i = 0; i < 100; i++) {
    events.push({
      id: i,
      value: Math.random() * 100
    });
  };

  return events; // will be JSON.stringified by Mirage
});
```

Returning a Model or Collection (from `schema`) lets you take advantage of the serializer layer.

```js
this.get('/api/users/:id', ({ users }, request) => {
  return users.find(request.params.id);
});
```

This handler returns a User model, which will pass through the UserSerializer if one exists, or the ApplicationSerializer otherwise.

You can also return an instance of `Response` to dynamically set headers and the status code:
```js
import Response from 'ember-cli-mirage/response';
```
```js
this.post('/api/messages', (schema, request) => {
  var params = JSON.parse(request.requestBody);

  if (!params.title) {
    return new Response(422, {some: 'header', 'Content-Type': 'application/json'}, {
      errors: [{
        status: 422,
        title: 'email is invalid',
        description: 'email cannot be blank'
      }]
    });
  } else {
    return schema.messages.create(params);
  }
});
```

If you return a string, it will not be `JSON.stringified`, so you can return responses other than JSON.

You may optionally return a promise resolving to any of the above, e.g.:

```js
this.get('/users', () => {
  return new Promise(resolve => {
    resolve(new Response(200, { 'Content-Type': 'text/csv' }, 'firstname,lastname\nbob,dylan'));
  });
});
```


### Helpers

The following helpers are available in your function handlers.

<a name="serialize" href="#serialize">#</a> this.<b>serialize</b>(<em>modelOrCollection</em>[, <em>serializerName</em>])

This helper returns the serialized JSON for the given *modelOrCollection*. It's useful if you want to do some final munging on the serialized JSON before returning it.

```js
this.get('/api/authors', function({ authors }) {
  let json = this.serialize(authors.all());

  json.meta = { page: 1 };

  return json;
});
```

By default this method uses the named serializer for the given Model or Collection. You can pass in a specific serializer via `serializerName`:

```js
this.get('/api/authors', function({ authors }) {
  let json = this.serialize(authors.all(), 'sparse-author');

  json.meta = { page: 1 };

  return json;
});
```

<a name="normalizedRequestAttrs" href="#normalizedRequestAttrs">#</a> this.<b>normalizedRequestAttrs</b>(<em>[ modelName ]</em>)

This helper will return the body of a request in a normalized form, suitable for working with and creating records.

For example, if your Ember app makes a POST request with this data

```
POST /users

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

Note that this helper method leverages your serializer's `normalize` function. In the example above, it's assumed that the app was using the `JSONAPISerializer`, which comes with the `#normalize` method already written. If you're not using one of the bundled serializers, you'll need to implement `#normalize` and have it return a JSON:API document to take advantage of this method.

Additionally, you'll need to use a full `function` here, as opposed to an ES6 arrow function (e.g `() => { ... }`). This is because `normalizeRequestAttrs` requires the `this` context from the function handler, and an arrow function would bind this from the outer scope.

`normalizedRequestAttrs()` relies on a `modelName` to work and attempts to automatically detect it based on the URL of the request. If you use conventional URLs – for example, PATCH /users/1 – the helper should work. If you are using something custom – for example, PATCH /users/edit/1 – you’ll need to provide the `modelName` to the helper:

```js
this.patch('/users/edit/:id', function(schema, request) {
  let attrs = this.normalizedRequestAttrs('user');
  ...
});
```

## External origins

You can use Mirage to simulate other-origin requests. By default, a route like

```js
this.get('/contacts', ...)
```

will hit the same origin that's serving your Ember app. To handle a different origin, use the fully qualified domain name:

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
