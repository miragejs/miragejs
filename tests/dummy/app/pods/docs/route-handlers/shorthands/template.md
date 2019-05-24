# Shorthands

APIs have become more standardized, so Mirage has the concept of *Shorthands* to deal with common scenarios. Shorthands can replace many of your custom route handlers, dramatically simplifying your server definition.

For example, this function route handler

```js
this.get('/movies', (schema, request) => {
  return schema.movies.all();
});
```

is pretty standard: it responds to a URL path with a collection of the same name.

The Shorthand form of this is

```js
this.get('/movies');
```

This is a complete route handler. It infers the model name from the last part of the URL, and returns the corresponding collection.

Returning a single movie by ID is just as easy:

```js
this.get('/movies/:id');
```

There are also Shorthands for creating and editing data. For example, this function route handler creates a new movie:

```js
this.post('/movies', (schema, request) => {
  let attrs = JSON.parse(request.requestBody).movie;

  return schema.movies.create(attrs);
});
```

It's also pretty standard: it creates a new model using the attributes from the request payload. The equivalent Shorthand is

```js
this.post('/movies');
```

See the full list of available Shorthands below. Shorthands use default status codes based on the HTTP verb:

  - GET, PATCH/PUT and DEL are 200
  - POST is 201

## GET Shorthands

Fetching a collection:

```js
// Shorthand
this.get('/contacts');          // finds type by singularizing url
this.get('/contacts', 'users'); // optionally specify the collection as second param

// equivalent
this.get('/contacts', (schema) => {
  return schema.contacts.all(); // users in the second case
});
```

Fetching a model:

```js
// Shorthand
this.get('/contacts/:id');         // finds type by singularizing url
this.get('/contacts/:id', 'user'); // optionally specify the type as second param

// equivalent
this.get('/contacts/:id', (schema, request) => {
  let id = request.params.id;

  return schema.contacts.find(id); // users in the second case
});
```

Fetching multiple models by ID (for example, `GET /contacts?ids=1,3`):

```js
// Shorthand
this.get('/contacts', { coalesce: true });
this.get('/contacts', 'users', { coalesce: true });

// equivalent
this.get('/contacts', ({ contacts }, request) => {
  let ids = request.queryParams.ids;

  return contacts.find(ids); // users in the second case
});
```


## POST Shorthands

Creating a resource:

```js
// Shorthand
this.post('/contacts');          // finds type by singularizing url
this.post('/contacts', 'user');  // optionally specify the type as second param

// equivalent
this.post('/contacts', function(schema, request) {
  let attrs = this.normalizedRequestAttrs();

  return schema.contacts.create(attrs);
});
```

For this POST shorthand to work, Mirage needs to know the format of the JSON payload your Ember app sends along with the request, so that it can insert the appropriate data into the database. See [the note on normalize](../serializers/#normalizejson) in the Serializer docs for more information.

## PATCH/PUT Shorthands

Updating a resource:

```js
// Shorthand (these also work with this.put)
this.patch('/contacts/:id');          // finds type by singularizing url
this.patch('/contacts/:id', 'user');  // optionally specify the type as second param

// equivalent
this.patch('/contacts/:id', function(schema, request) {
  let id = request.params.id;
  let attrs = this.normalizedRequestAttrs();

  return schema.contacts.find(id).update(attrs);
});
```

For this PATCH shorthand to work, Mirage needs to know the format of the JSON payload your Ember app sends along with the request, so that it can insert the appropriate data into the database. See the note on normalize in the Serializer docs for more information.

## DELETE Shorthands

Destroying a resource:

```js
// Shorthand
this.del('/contacts/:id');          // finds type by singularizing url
this.del('/contacts/:id', 'user');  // optionally specify the type as second param

// equivalent
this.del('/contacts/:id', (schema, request) => {
  let id = request.params.id;

  schema.contacts.find(id).destroy();
});
```

Destroying a resource and related models:

```js
// Shorthand
this.del('/contacts/:id', ['contact', 'addresses']);

// equivalent
this.del('/contacts/:id', ({ contacts }, request) => {
  let id = request.params.id;
  let contact = contacts.find(id);

  contact.addresses.destroy();
  contact.destroy();
});
```

To use this Shorthand, you must have the appropriate `hasMany`/`belongsTo` relationships defined in your data layer.


## Resource helper

The _resource_ helper lets you define multiple Shorthands for a given resource:

```js
// Resource helper usage
this.resource('contacts');

// Shorthands defined
this.get('/contacts');
this.get('/contacts/:id');
this.post('/contacts');
this.patch('/contacts/:id'); // and this.put('/contacts/:id')
this.del('/contacts/:id');
```

You can also whitelist which Shorthands will be defined using the _only_ option:

```js
this.resource('contacts', { only: [ 'index', 'show' ] });

// Shorthands defined
this.get('/contacts');
this.get('/contacts/:id');
```

or which route handlers shouldn't be defined using _except_ option:

```js
this.resource('contacts', { except: [ 'update' ] });

// Shorthands defined
this.get('/contacts');
this.get('/contacts/:id');
this.post('/contacts');
this.del('/contacts/:id');
```

If your route path and collection names do not match, you can define a relative or absolute path using the _path_ option:

```js
this.resource('blog-posts', { path: '/posts' });

// Shorthands defined
this.get('/posts', 'blog-posts');
this.get('/posts/:id', 'blog-posts');
this.post('/posts', 'blog-posts');
this.put('/posts/:id', 'blog-posts');
this.patch('/posts/:id', 'blog-posts');
this.del('/posts/:id', 'blog-posts');
```

Here is the full reference of the actions' names you can pass to the _only_ / _except_ options and the Shorthands they stand for:

```
Action   |  Shorthand
------------------------------
index    | this.get('/contacts')
show     | this.get('/contacts/:id')
create   | this.post('/contacts')
update   | this.patch('contacts/:id') (or this.put)
delete   | this.del('/contacts/:id')
```

---

Shorthands are a key part of staying productive in your frontend codebase, but they only work so well because Mirage has a Data Layer that's aware of your application's domain model.

We'll cover how it works in the next few sections of the docs.
