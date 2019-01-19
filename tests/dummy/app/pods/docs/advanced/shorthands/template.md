# Shorthand reference

A *shorthand* is a simple way to define a route handler for common API scenarios. Here's a reference of each shorthand, along with the raw route handler that the shorthand represents.

In Mirage 0.1, shorthands responded with objects and arrays directly from the database. In 0.2, shorthands return Models and Collections, meaning you can customize the format of the response in the [serializer layer](../serializers).

Shorthands use default status codes, based on the HTTP verb:

  - GET, PUT and DEL are 200
  - POST is 201

## GET shorthands

*Collection*

```js
// shorthand
this.get('/contacts');          // finds type by singularizing url
this.get('/contacts', 'users'); // optionally specify the collection as second param

// equivalent
this.get('/contacts', ({ contacts }) => {
  return contacts.all(); // users in the second case
});
```

*Model*

```
// shorthand
this.get('/contacts/:id');         // finds type by singularizing url
this.get('/contacts/:id', 'user'); // optionally specify the type as second param

// equivalent
this.get('/contacts/:id', ({ contacts }, request) => {
  let id = request.params.id;

  return contacts.find(id); // users in the second case
});
```

*Array of Models*

For example, `GET /contacts?ids=1,3`

```js
// shorthand
this.get('/contacts', { coalesce: true });
this.get('/contacts', 'users', { coalesce: true });

// equivalent
this.get('/contacts', ({ contacts }, request) => {
  let ids = request.queryParams.ids;

  return contacts.find(ids); // users in the second case
});
```

---

*Note: there used to be a *Single record with related records *shorthand. You should now use serializers and relationships to solve this problem.*

## POST shorthands

*Creating a resource*

```js
// shorthand
this.post('/contacts');          // finds type by singularizing url
this.post('/contacts', 'user');  // optionally specify the type as second param

// equivalent
this.post('/contacts', function({ contacts }, request) {
  let attrs = this.normalizedRequestAttrs();

  return contacts.create(attrs);
});
```

For this POST shorthand to work, Mirage needs to know the format of the JSON payload your Ember app sends along with the request, so that it can insert the appropriate data into the database. See [the note on normalize](../serializers/#normalizejson) in the Serializer docs for more information.

## PUT shorthands

*Update a resource*

```js
// shorthand
this.put('/contacts/:id');          // finds type by singularizing url
this.put('/contacts/:id', 'user');  // optionally specify the type as second param

// equivalent
this.put('/contacts/:id', function({ contacts }, request) {
  let id = request.params.id;
  let attrs = this.normalizedRequestAttrs();

  return contacts.find(id).update(attrs);
});
```

For this PUT shorthand to work, Mirage needs to know the format of the JSON payload your Ember app sends along with the request, so that it can insert the appropriate data into the database. See the note on normalize in the Serializer docs for more information.

## DELETE shorthands

*Remove a resource*

```js
// shorthand
this.del('/contacts/:id');          // finds type by singularizing url
this.del('/contacts/:id', 'user');  // optionally specify the type as second param

// equivalent
this.del('/contacts/:id', ({ contacts }, request) => {
  let id = request.params.id;

  contacts.find(id).destroy();
});
```

*Remove a resource and related models*

To use this shorthand, make sure you have the appropriate `hasMany`/`belongsTo` relationships defined on your models.

```js
// shorthand
this.del('/contacts/:id', ['contact', 'addresses']);

// equivalent
this.del('/contacts/:id', ({ contacts }, request) => {
  let id = request.params.id;
  let contact = contacts.find(id);

  contact.addresses.destroy();
  contact.destroy();
});
```

## Resource helper

For handling generic CRUD, you can use *resource* helper which will take care of defining all shorthands. The following examples are equivalent:

```js
// shorthand
this.resource('contacts'); // available in 0.2.2+

// equivalent
this.get('/contacts');
this.get('/contacts/:id');
this.post('/contacts');
this.put('/contacts/:id');
this.patch('/contacts/:id');
this.del('/contacts/:id');
```

You can also whitelist which route handlers will be defined using *only* option:

```js
// shorthand
this.resource('contacts', { only: ['index', 'show'] });

// equivalent
this.get('/contacts');
this.get('/contacts/:id');
```

or which route handlers shouldn't be defined using *except* option:

```js
// shorthand
this.resource('contacts', { except: ['update'] });

// equivalent
this.get('/contacts');
this.get('/contacts/:id');
this.post('/contacts');
this.del('/contacts/:id');
```

If your route path and collection names do not match, you can define a relative or absolute path using the *path* option:

```js
// shorthand
this.resource('blog-posts', { path: '/posts' });

// equivalent
this.get('/posts', 'blog-posts');
this.get('/posts/:id', 'blog-posts');
this.post('/posts', 'blog-posts');
this.put('/posts/:id', 'blog-posts');
this.patch('/posts/:id', 'blog-posts');
this.del('/posts/:id', 'blog-posts');
```

Here is the full reference of actions' names you can pass to *only* / *except* options and the shorthands they stand for:

| Action | Shorthand                                    |
|:-------|:---------------------------------------------|
| index  | `this.get('/contacts')`                      |
| show   | `this.get('/contacts/:id')`                  |
| create | `this.post('/contacts')`                     |
| update | `this.patch('contacts/:id')` (or `this.put`) |
| delete | `this.del('/contacts/:id')`                  |
