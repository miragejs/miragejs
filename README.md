# Ember Pretenderify

Share a single Pretender server across your Ember app's testing and development environments.

> **WARNING**: this is a spike. you probably shouldn't use it

---

Are you tired of

- Writing one set of mocks for your tests, and another for development?
- Wiring up tests for each of your apps manually, from scratch?
- Changing lots of files/tests when your API changes?

Ember Pretenderify may be for you! It lets you share your [Pretender](https://github.com/trek/pretender) server in both development and in testing. It only uses Pretender if you're not in production and if you're not proxying to an explicit API server via `ember serve --proxy`.

## Installation

    ember install:addon ember-pretenderify

*Testing*

In your `tests/helpers/start-app.js`,

```js
import pretenderifyTesting from '../../ember-pretenderify/testing';

export default function startApp(attrs) {
  ...

  pretenderifyTesting.setup(application);

  return application;
}
```

You'll also want to add `serverData` to the `predef` section in your `tests/.jshintrc` file.

## Getting started

Create the file `app/pretender/config.js` and export a function. `this` inside the function refers to the Pretender server, so this is your chance to add routes, modify the default configuration, etc. Here's an example:

```js
// app/pretender/config.js
export default function() {

  this.get('api/contacts', function(request) {
    var contacts = [{id: 1, name: 'Zelda'}];

    return [200, {}, contacts];
  });

};
```

That's it! Now if you run `ember s` (and don't pass a `--proxy` option), or run tests, your app will get this response whenever it makes a GET request to `/api/contacts`.

## Adding some structure

You can use Pretender's API and structure your routes and data however you please, but the goal of this project is to converge on a single organizational strategy.

To play along, create the file `app/pretender/data/index.js` and create your data in files under this new `/data` folder. Export all your data from `/data/index.js`, like this:

```js
// app/pretender/data/contacts.js
export default [
  {
    id: 1,
    name: 'Zelda'
  }
];

// app/pretender/data/index.js
import contacts from './contacts';

export default {
  contacts: contacts
}
```

Now, this data will be attached to your Pretender server's **store**. The store is similar in concept to Ember Data's store - it's a cache of data. As long as all your Pretender routes mutate and read from the store, your user interactions during development will persist. This lets you interact with your app as if it were wired up to a real server.

**stub** is a helper method that lets you easily interact with your Pretender server's store while defining routes. Here's how a route defined in our `app/pretender.js` file could look:

```js
this.stub('get', '/contacts', 'contacts');
```

This is the simplest example of a GET route. Here, we're telling Pretender that when there's a GET request for `/contacts`, respond with all the `contacts` in our store. So the first param is the *verb*, the second the *path*, and the third the *objects in the store* we want to respond with.

We can also respond with multiple objects from the store, let's say if our app expects additional data to be sideloaded at this URL:

```js
this.stub('get', '/contacts', ['contacts', 'addresses']);
```

This will return all the data you added to the `contacts` and `address` keys of your store.

You can find the full API for **stub** below.

*Testing*

During testing, the store always starts off empty; however, all the routes you've defined will be available (since these are what your app expects, and shouldn't change within your tests). The reason we clear out the store is that tests should be atomic, and not rely on state defined elsewhere.

So, the only setup work you have to do within each test is to define the initial state of the store, i.e. the state of your "server". Then, write your test and assert based on that state. There's a global helper called `serverData` to help you do that.

A hypothetical test will look like this:

```js
test("I can view the models", function() {
  serverData.products = [
    {
      id: 1,
      name: 'iPhone'
    }
  ];

  visit('/');

  andThen(function() {
    equal(currentRouteName(), 'index');
    equal( find('p').text(), 'iPhone' );
  });
});
```

In the future, we plan on making factories with a simpler API to help you add data to your Pretender server's store. But fundamentally, the point here is that the routes and config you've defined for your Pretender server will be shared across your development and testing environments.

## Default config

These options can be overridden in your `/pretender/config.js` file.

- Content returned is JSON stringified, so you don't have to do this yourself.

*force*

By default, your Pretender server will run in test mode, and in development mode as long as the `--proxy` option wasn't passed. You can force your server to run in other environments (e.g. production) with an ENV var:

```js
// config/environment.js
...
ENV['ember-pretenderify'] = {
  force: true
}
```

This is useful to share a working prototype before a server is ready, for instance.

## API

### config

These options are available within your `/pretender/config.js` file.

**namespace**

Set the base namespace used for all routes defined with `stub`. For example,

```js
// app/pretender/config.js
export default function() {

  this.namespace = '/api';

  // this route will handle the URL '/api/contacts'
  this.stub('get', '/contacts', function(store, request) {
    // ... 
  });
};
```

**timing**

Set the timing parameter of the response. Default is a 400ms delay. Only applies to non-testing environments. See [Pretender's docs](https://github.com/trek/pretender#timing-parameter) for all possible values.

```js
// app/pretender/config.js
export default function() {

  this.timing = 400; // default

};
```

### store

You interact with the store using the *stub* method in your Pretender routes. You retrieve or modify data from the store, then return what you want for that route. 

Here are the methods available to you from within your routes using *stub*.

**store.find(key)**

Returns the `key` models attached to the store object. Note `key` is always singular.

For example if you had exported the following object from `/app/pretender/data/index.js`

```js
export default {
  contacts: [{id: 1, name: 'Sam'}, {id: 2, name: 'Ryan'}]
}
```

then `store.find('contact')` would return the `contacts` array.

**store.find(key, id)**

Returns a single model from the store based on the key `key` and id `id`. Note `key` is always singular.

For example, given the above contacts in the store, `store.find('contact', 2)` would return `{id: 2, name: 'Ryan'}`.

**store.push(key, data)**

Creates or updates a model of type `key` in the store. `data` is a POJO. If `data` has an `id`, updates the model in the, otherwise creates a new model.


### stub

Sets content type to `application/json` and lets you specify which data to return from the store.

```js
this.stub(verb, path, handler[, responseCode]);
```

- **verb**: string. 'get', 'put', 'post', or 'delete'
- **path**: string. The URL you're defining, e.g. '/api/contacts' (or '/contacts' if `namespace` is defined).
- **handler**: function. Return the data you want to be in the response body as plain JS - it will be stringified. Accepts two parameters, *store*, your Pretender server's store, and *request*, which is the Pretender request object.
- **responseCode**: number. optional. The response code of the request.

There are some shorthands. Here are some examples:

**Returning collections from the store (GET)**

Response code defaults to 200.

The shorthand versions of the functions below only work if the verb is `get`.

```js
/*
  Return a collection
*/
this.stub('get', '/contacts', function(store) {
  return {
    contacts: store.find('contact');
  }:
});
// shorthand. Finds type by singularizing last portion of url.
this.stub('get', '/contacts');
// optionally specify which collection
this.stub('get', '/contacts', 'users');

/*
  Return a collection with related models
*/
this.stub('get', '/contacts', function(store) {
  var contacts = store.find('contact');
  var addresses = store.find('address');

  // But we only want the related addresses, so...
  var contactIds = contacts
    .map(function(contact) {return contact.id});
  var relatedAddresses = addresses
    .filter(function(addr) {return contactIds.indexOf(addr.contact_id) > -1; });

  return {
    contacts: contacts,
    addresses: relatedAddresses
  }:
});
// shorthand
// none yet

/*
  Return multiple collections.
*/
this.stub('get', '/', function(store, request) {
  var photos = store.find('photo');
  var articles = store.find('article');

  return {
    photos: photos,
    articles: articles
  }:
});
// shorthand. Note this is everything you have in your store for these models.
this.stub('get', '/', ['photos', 'articles']);
```

**Returning a single object from the store (GET)**

Response code defaults to 200.

```js
/*
  Return a single object
*/
this.stub('get', '/contacts/:id', function(store, request) {
  var contactId = +request.params.id;
  var contact = store.find('contact', contactId);

  return {
    contact: contact
  };
});
// shorthand
this.stub('get', '/contacts/:id');
// Optionally specify type
this.stub('get', '/contacts/:id', 'user');

/*
  Return a single object with related models
*/
this.stub('get', '/contacts/:id', function(store, request) {
  var contactId = +request.params.id;
  var contact = store.find('contact', contactId);
  var addresses = store.find('address')
    .filterBy('contact_id', contactId);

  return {
    contact: contact,
    addresses: addresses
  };
});
// shorthand. It returns only related models, since since contact is singular. 
// Make sure you put the singular model first.
this.stub('get', '/contacts/:id', ['contact', 'addresses']);
```

**Creating a resource (POST)**

Response code defaults to 201 for `post`.

The shorthand versions of the functions below only work if the verb is `post`.

```js
/*
  Create a new object
*/
this.stub('post', '/contacts', function(store, request) {
  var newContact = JSON.parse(request.requestBody);

  store.push('contact', newContact);
  return newContact;
});
// shorthand. The type is found by singularizing the last portion of the url.
this.stub('post', '/contacts');
// Optionally specify the type of resource to be created as the third param.
this.stub('post', '/contacts', 'user');
```

**Updating a resource (PUT)**

Response code defaults to 200 for `put`.

The shorthand versions of the functions below only work if the verb is `put`.

```js
/*
  Update an object in the store.
*/
this.stub('put', '/contacts/:id', function(store, request) {
  var id = request.params.id;
  var attrs = JSON.parse(request.requestBody);
  attrs.id = +id;

  store.push('contact', attrs);
  return {contact: attrs};
});
// shorthand. The type is found by singularizing the last portion of the url.
this.stub('put', '/contacts/:id');
// Optionally specify the type of resource to be updated as the third param.
this.stub('post', '/contacts/:id', 'user');
```

**Deleting resources from the store (DELETE)**

Response code defaults to 200 for `delete`.

The shorthand versions of the functions below only work if the verb is `delete`.

```js
/*
  Remove a single object
*/
this.stub('delete', '/contacts/:id', function(store, request) {
  var contactId = +request.params.id;

  store.remove('contact', contactId);

  return {};
});
// shorthand. The type is found by singularizing the last portion of the url.
this.stub('delete', '/contacts/:id')
// Optionally specify the type of resource to be deleted.
this.stub('delete', '/contacts/:id', 'user')

/*
  Remove a single object + related models
*/
this.stub('delete', '/contacts/:id', function(store, request) {
  var contactId = +request.params.id;

  store.remove('contact', contactId);
  store.remove('address', {contact_id: contactId});

  return {};
});
// shorthand. Make sure the parent resource is first.
this.stub('delete', '/contacts/:id', ['contact', 'addresses']);
```

# TODO

**setup**
- [ ] setup testing stuff automatically or with a blueprint

**tests**
- [ ] override route in test to return 404

**stub**
- [ ] shorthand for multiple data relationships, e.g. lesson has many questions, questions has many answers
- [ ] with where/query
- [ ] with attrs (partial models)

**Roadmap**
- [ ] Adapter, only works with AMS-style right now.
- [ ] Factories for adding data to store in tests.
- [ ] Write more tests for my testing library that helps you test.
- [ ] Docs: explain that if api changes, only routes need to change, not (future hypothetical) factories or tests
