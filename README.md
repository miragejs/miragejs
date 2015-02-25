# Ember Pretenderify

[![Build Status](https://travis-ci.org/samselikoff/ember-pretenderify.svg?branch=master)](https://travis-ci.org/samselikoff/ember-pretenderify)
[![npm version](https://badge.fury.io/js/ember-pretenderify.svg)](http://badge.fury.io/js/ember-pretenderify)

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

Finally, add `server` to the `predef` section in your `tests/.jshintrc` file.

## Updating

This project is new and the API is subject to change. When updating your project to a newer version of Ember Pretenderify, please consult [the changelog](/CHANGELOG.md) for any update notes.

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

Given this file, whenever your Pretender server starts up, this data will be added to its store under the `contacts` key (since that's the name of the file). Add additional data by adding more files under the `/data` folder. All data files should be plural, and export arrays of POJOs.

Now, to return this data from an endpoint, let's create our first route. We'll use the **get** helper method to easily interact with our server's store (which now has these contacts in it).

The generator should have created the file `app/pretender/config.js`, which exports a function. Add a route for `/api/contacts`:

```js
// app/pretender/config.js
export default function() {

  this.get('/api/contacts', 'contacts');

};
```

This is the simplest example of a GET route. Here, we're telling Pretender that whenever our Ember app makes a GET request to `/api/contacts`, respond with all the `contacts` in our store. So the first argument of `get` is the *path* of the route we're defining a handler for, and the second is the *objects in the store* we want to respond with.

As long as all your Pretender routes mutate and read from the store, your user interactions during development will persist. This lets users interact with your app as if it were wired up to a real server.

We can also respond with multiple objects from the store, let's say if our app expects additional data to be sideloaded at this URL:

```js
this.get('/api/contacts', ['contacts', 'addresses']);
```

This will return all the data you added to the `contacts` and `addresses` keys of your store.

Handling POST, PUT and DELETE requests is just as simple. For example, this route lets you create new `users` by POSTing to `/api/users`:

```js
this.post('/api/users', 'user');
```

You can also pass a function in as the second argument in case you want to manipulate the store yourself:

```js
this.post('/api/users', function(store, request) {
  var attrs = JSON.parse(request.requestBody);
  var newContact = store.push('contact', attrs);

  return {
    contact: newContact
  };
});
```

Find the complete documentation for `get`, `post`, `put` and `del` [**below**](#verb-methods).

**Shorthands**

There are many shorthands available to make writing your routes easier. For example, the route

```js
this.get('/api/contacts', 'contacts');
```

can be simplified to

```js
this.get('/api/contacts')
```

since the key of the last URL segment matches the store object we want.

See [the docs below](../../wiki/HTTP-Verb-methods) for all available shorthands.

**Acceptance testing**

During testing, the store always starts off empty; however, all the routes you've defined will still be available (since these are what your app expects, and mostly shouldn't change within your tests). The store is emptied because tests should be atomic, and should not rely on state defined elsewhere.

So for each test, you first define the initial state of the store (i.e. the "server" state your test expects). Then, write your test and assert based on that state.

There's a global helper called `store` to help you with this. Here's an example acceptance test:

```js
// tests/acceptance/index-test.js
test("I can view the models", function() {
  // set up our "server's data"
  store.loadData({
    products = [{
      id: 1,
      name: 'iPhone'
    }]
  });

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

That should be enough to get started! Check out the [dummy config](tests/dummy/app/pretender/config.js) in this repo for a simple example, or [browse the wiki](../../wiki) for the full API.

## Full documentation

[View the wiki](../../wiki)

## FAQ

### Known issues

- Pretender doesn't handle other-origin requests (e.g. api.twitter.com)

### Support

Having trouble? Open an issue!
