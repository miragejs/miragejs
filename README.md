# Ember CLI Mirage

[![Build Status](https://travis-ci.org/samselikoff/ember-cli-mirage.svg?branch=master)](https://travis-ci.org/samselikoff/ember-cli-mirage)
[![npm version](https://badge.fury.io/js/ember-cli-mirage.svg)](http://badge.fury.io/js/ember-cli-mirage)

A client-side server to develop, test and prototype your Ember CLI app.

----

Are you tired of

- Writing one set of mocks for your tests, and another for development?
- Wiring up tests for each of your apps manually, from scratch?
- Changing lots of files/tests when your API changes?

Ember CLI Mirage may be for you! It lets you create a client-side server using [Pretender](https://github.com/trek/pretender) to help you develop and test your app. By default, it only runs if you're not in production and if you're not proxying to an explicit API server via `ember serve --proxy`.

## Installation

    ember install:addon ember-cli-mirage

and add `server` to the `predef` section in your `tests/.jshintrc` file.

## Updating

This project is new and the API is subject to change. When updating your project to a newer version of Ember CLI Mirage, please consult [the changelog](/CHANGELOG.md) for any update notes.

## Getting started

A Mirage server is split into two pieces:

 - **routes**, which define the URLs your server responds to, and
 - a **database**, your server's clientside cache

Let's add some data to the database. The generator should have created the file `/app/mirage/fixtures/contacts.js`, which exports some data:

```js
// app/mirage/fixtures/contacts.js
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

Given this file, whenever your Mirage server starts up, this data will be added to its database under the `contacts` key (since that's the name of the file). Add additional data by adding more files under the `/fixtures` folder. All fixture files should be plural, and export arrays of POJOs.

### Defining your routes

Now, to return this data from an endpoint, let's define our first route. We'll use the **get** helper method to easily interact with our server's db (which now has these contacts in it).

The generator should have created the file `app/mirage/config.js`, which exports a function. Add a route for `/api/contacts`:

```js
// app/mirage/config.js
export default function() {

  this.get('/api/contacts', 'contacts');

};
```

This is the simplest example of a GET route. Here, we're telling Mirage that whenever our Ember app makes a GET request to `/api/contacts`, respond with all the `contacts` in our db. So the first argument of `get` is the *path* of the route we're defining a handler for, and the second is the *objects in the db* we want to respond with.

As long as all your Mirage routes read from and write to the db, your user interactions during development will persist. This lets users interact with your app as if it were wired up to a real server.

We can also respond with multiple objects from the db, let's say if our app expects additional data to be sideloaded at this URL:

```js
this.get('/api/contacts', ['contacts', 'addresses']);
```

This will return all the data you added to the `contacts` and `addresses` keys of your db.

Handling POST, PUT and DELETE requests is just as simple. For example, this route lets you create new `users` by POSTing to `/api/users`:

```js
this.post('/api/users', 'user');
```

Passing just a string or array as the second argument to get, post, put or del
(as shown above) is an example of a **shorthand**. There are [several available](../../wiki/HTTP-Verb-methods)
to make writing your routes as concise as possible, but sometimes you'll need
to do some custom work. In that case, you can pass a function in as the second
argument, and interact directly with the db and Pretender request object:

```js
this.post('/api/users', function(db, request) {
  var attrs = JSON.parse(request.requestBody);
  var newContact = db.contacts.insert(attrs);

  return {
    contact: newContact
  };
});
```

Find the complete documentation for the db as well as the rest of the
available shorthands for `get`, `post`, `put` and `del` [in the wiki](../../wiki).

### Acceptance testing

During testing, the db always starts off empty; however, all the routes you've defined will still be available (since these are what your app expects, and mostly shouldn't change within your tests). The db is emptied because tests should be atomic, and should not rely on state defined elsewhere. This means the data you've added under `/mirage/fixtures` will not be available in your tests.

Instead, to get data into your tests, you'll define factories. That way, each test can create the data it needs (i.e. it can set up the "server state" it expects), and then assert against that data.

Let's define a `contact` factory. The generator should have created the file `/test/factories/contact.js` - the name of the file is how you reference the factory:

```js
// tests/factories/contact.js
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: 'Pete',
  age: 20,

  email: (i) => `person${i}@test.com`,

  admin: function(i) {
    return this.age > 30;
  }
});
```

The attributes of your factory can either be plain numbers or strings, or functions. A function gets the sequence of the factory *i* as its only parameter. Within the function you can also reference the plain attributes (numbers and strings) of the generated object via `this.attr`.

Let's use this factory in an acceptance test. We want to assert against our index route, assuming there are three contacts in our server when our Ember app boots up and renders.

In your tests you'll have access to the `server` variable, which has two helper methods attached to it: `create` and `createList`. Let's use `createList` to set up our server's state for this test:

```js
// tests/acceptance/index-test.js

test("I can view the contacts", function() {
  // set up our server's state
  var contacts = server.createList('contact', 3);

  visit('/');

  andThen(function() {
    equal(currentRouteName(), 'index');
    equal( find('li').length, 3 );
    equal( find('li:first').text(), contacts[0].name );
  });
});
```

You can also put calls to `create` and `createList` within your test module's `setup` block if you want to share them across `test`s. You can even test how your UI reacts when your server [responds slowly](https://github.com/samselikoff/ember-cli-mirage/wiki/Acceptance-testing#timing) or [responds with an error](https://github.com/samselikoff/ember-cli-mirage/wiki/Acceptance-testing#verb).

View the [acceptance test wiki page](../../wiki/Acceptance-testing) for more examples and the full API.

-----

That should be enough to get started! The dummy app in this example has a fully working [config](tests/dummy/app/mirage/config.js), [factory](tests/factories/contact.js), and some [acceptance tests](tests/acceptance) you can look at. Be sure to [check out the wiki](../../wiki) for the full API.

## Full documentation

[View the wiki](../../wiki)

## FAQ

### Known issues

- Pretender doesn't handle other-origin requests (e.g. api.twitter.com)

### Support

Having trouble? Open an issue!
