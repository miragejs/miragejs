# Ember Pretenderify

Share a single Pretender server across your Ember app's testing and development environments.

----

Are you tired of

- Writing one set of mocks for your tests, and another for development?
- Wiring up tests for each of your apps manually, from scratch?
- Changing lots of files/tests when your API changes?

Ember Pretenderify may be for you! It lets you share your [Pretender](https://github.com/trek/pretender) server in both development and in testing. It only uses Pretender if you're not in production and if you're not proxying to an explicit API server via `ember serve --proxy`.

## Installation

Uninstall `ember-cli-pretender` if you're already using it. Then run

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

Pretenderify splits up your Pretender server into two pieces:

 - **routes**, which define the URLs your server responds to, and
 - the **store**, your server's "database"

Let's add some data to the store. The generator should have created the file `/app/pretender/data/contacts.js`, which exports some data:

```js
// app/pretender/data/contacts.js
export default [
  {
    id: 1,
    name: 'Zelda'
  },
  {
    id: 2,
    name: 'Link'
  },
];
```

Given this file, whenever your Pretender server starts up, this data will be added to its store under the `contacts` key (since that's the name of the file). Add additional data by adding more files under the `/data` folder.

Now, to return this data from an endpoint, let's create our first route. We'll use the **stub** helper method to easily interact with our server's store (which now has these contacts in it).

The generator should have created the file `app/pretender/config.js`, which exports a function. Add a route for `/api/contacts`:

```js
// app/pretender/config.js
export default function() {

  this.stub('get', '/api/contacts', 'contacts');

};
```

This is the simplest example of a GET route. Here, we're telling Pretender that whenever our Ember app makes a GET request to `/api/contacts`, respond with all the `contacts` in our store. So the first argument of stub is the *verb*, the second is the *path*, and the third is the *objects in the store* we want to respond with.

As long as all your Pretender routes mutate and read from the store, your user interactions during development will persist. This lets users interact with your app as if it were wired up to a real server.

We can also respond with multiple objects from the store, let's say if our app expects additional data to be sideloaded at this URL:

```js
this.stub('get', '/api/contacts', ['contacts', 'addresses']);
```

This will return all the data you added to the `contacts` and `addresses` keys of your store.

There are many shorthands to make writing your routes easier. For example,

```js
this.stub('get', '/api/contacts')
```

works the same as the first route above, since the key of the last URL segment matches the store object we want. You can also pass a function as the third argument and do custom work. You can find the full API for [**stub**](#stub) below.

**Acceptance testing**

During testing, the store always starts off empty; however, all the routes you've defined will still be available (since these are what your app expects, and mostly shouldn't change within your tests). The store is emptied because tests should be atomic, and not rely on state defined elsewhere.

So for each test, you first define the initial state of the store (i.e. the "server" state your test expects). Then, write your test and assert based on that state.

There's a global helper called `serverData` to help you with this. Here's an example acceptance test:

```js
// tests/acceptance/index-test.js
test("I can view the models", function() {
  // set up our "server's data"
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

Another benefit of separating your server's routes from its data is that your tests become less brittle. Say you change your API for some route from using links (async model relationships) to having everything sideloaded. The only thing you need to change here is the related route definition, in your `/pretender/config.js` file. You won't need to update your tests, since they just specify what's in the store at the time of the test (which wouldn't change in this case).

-----

That should be enough to get started! Check out the [dummy config](tests/dummy/app/pretender/config.js) in this repo for a simple example, or keep on reading for the full API.

## Configuration

There's some default configuration for your Pretender server which can all be customized. `this` in your `/pretender/config.js` file refers to the actual [`Pretender`](https://github.com/trek/pretender) instance, so any config options that work there will work here as well.

**prepareBody**

By default, content returned is JSON stringified, so you can just return JS objects. Refer to [Pretender's docs](https://github.com/trek/pretender#mutating-the-body) if you want to change this.

**namespace**

Set the base namespace used for all routes defined with `stub`. For example,

```js
// app/pretender/config.js
export default function() {

  this.namespace = '/api';

  // this route will handle the URL '/api/contacts'
  this.stub('get', '/contacts', 'contacts');
};
```

**timing**

Set the timing parameter of the response. Default is a 400ms delay. This parameter only applies to non-testing environments so it doesn't slow down your tests. See [Pretender's docs](https://github.com/trek/pretender#timing-parameter) for all possible values.

```js
// app/pretender/config.js
export default function() {

  this.timing = 400; // default

};
```

**Environment options**

*force*

By default, your Pretender server will run in test mode, and in development mode as long as the `--proxy` option isn't passed. You can force your server to run in other environments (e.g. production) with an ENV var:

```js
// config/environment.js
...
ENV['ember-pretenderify'] = {
  force: true
}
```

This is useful to be able to share a working prototype (built with `--environment production`) before a server is ready, for instance.

## API

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

##store.remove(key, id)**

Removes a model of type `key` with id `id` from the store.

### stub

The stub method is the primary way you define routes and interact with your store. There are many shorthands available to make your server definition more succinct, but you can always fallback to a function and manipulate the store however you need to.

Here's the full definition:

```js
this.stub(verb, path, handler[, responseCode]);
```

- **verb**: string. 'get', 'put', 'post', or 'delete'
- **path**: string. The URL you're defining, e.g. '/api/contacts' (or '/contacts' if `namespace` is defined).
- **handler**: function. Return the data you want as the response body as plain JS - it will be stringified. Accepts two parameters, *store*, your Pretender server's store, and *request*, which is the Pretender request object. 
    There are many shorthands available for this param.
- **responseCode**: number. optional. The response code of the request.

Here are some examples:

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
