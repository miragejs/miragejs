# Ember Pretenderify

Share a single Pretender server across your Ember app's testing and development environments.

> **WARNING**: this is a spike. you probably shouldn't use it

---

Are you

- Tired of writing one set of mocks for your tests, and another for development?
- Love Pretender but hate wiring up every app manually?

Ember Pretenderify may be for you! It lets you share your [Pretender](https://github.com/trek/pretender) server in both development and in testing. It only uses Pretender if you're not in production and if you're not proxying to an explicit API server via `ember serve --proxy`.

## Installation

```
ember install:addon ember-pretenderify
```

*Testing*

In your `tests/helpers/start-app.js`,

```
import pretenderifyTesting from '../../ember-pretenderify/testing';

export default function startApp(attrs) {
  ...

  pretenderifyTesting.setup(application);

  return application;
}
```

## Getting started

Create the file `app/pretender/config.js` and export a function. `this` inside the function refers to the Pretender server, so this is your chance to add routes, modify the default configuration, etc. Here's an example:

```
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

```
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

```
this.stub('get', '/contacts', 'contacts');
```

This is the simplest example of a GET route. Here, we're telling Pretender that when there's a GET request for `/contacts`, respond with all the `contacts` in our store. So the first param is the *verb*, the second the *path*, and the third the *objects in the store* we want to respond with.

We can also respond with multiple objects from the store, let's say if our app expects additional data to be sideloaded at this URL:

```
this.stub('get', '/contacts', ['contacts', 'addresses']);
```

We now need to tell Pretender exactly how to return these objects, i.e. how to serialize them. Remember, they are currently arrays of POJOs. Should we add all related models to the root of our JSON response? Should we nest them? Of course, the answers to these questions depend on the data format your Ember app is expecting (or, in the case of Ember Data, which adapter you're using).

Right now, the response aligns with ActiveModel-style responses, e.g. models will be side-loaded at the root:

```
{
  contacts: [{id: 1, name: Zelda, address_ids: [1, 2]}, ...],
  addresses: [{id: 1, street: '123 Hyrule Way', contact_id: 1}, ...]
}
```

> TODO: think more about this. adapter pattern. Currently, only ActiveModel-type responses are supported, i.e. models are sideloaded. Don't need full adapter though, bc the data loaded into the store is already very close to the format expected by the user's app - after all, the user is deciding that format. It's just about, when a route requests "model A" and "model B", how do I return them? Probably just have a method whose param is the array, and they get to manipulate it however they want. But then there might be route-specific differences, etc. Need to think more about this.

You can find the full API for **stub** below.

*Testing*

During testing, the store always starts off empty; however, all the routes you've defined will be available (since these are what your app expects, and shouldn't change within your tests). The reason we clear out the store is that tests should be atomic, and not rely on state defined elsewhere.

So, the only setup work you have to do within each test is to define the initial state of the store, i.e. the state of your "server". Then, write your test and assert based on that state. There's a global helper called `serverData` to help you do that.

A hypothetical test will look like this:

```
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

> Question: what about overriding a route in a test to return a 404, and see how ember app deals w/it?

## Default config

These options can be overridden in your `/pretender/config.js` file.

- Content returned is JSON stringified, so you don't have to do this yourself.

## API

**stub**

Sets content type to 'application/json', and lets you specify which data to return from the store.

```
this.stub(verb, path, handler(request)[, responseCode]);
```

**verb**: string. 'get', 'put', 'post', or 'delete'
**path**: string. The URL you're defining, e.g. '/api/contacts'.
**handler**: function. Return the data you want to be in the response body as plain JS - it will be stringified. Accepts one parameter, *request*, which is the Pretender request object.
**responseCode**: number. optional. The response code of the request.

There are some shorthands. Take a look at some examples:

```js
// GET a collection
this.stub('get', '/contacts', function(request) {
  return ['contacts'];
});
// shorthand
this.stub('get', '/contacts', 'contacts');
this.stub('get', '/contacts', ['contacts', 'addresses']);

// GET a single object
this.stub('get', '/contacts/:id', function(request) {
  var contactId = request.params.id;

  return [{key: 'contacts', where: {id: contactId}}, 'addresses']);
});
// shorthand. It returns the contact by id, since contact is singular
this.stub('get', '/contacts/:id', 'contact');
this.stub('get', '/contacts/:id', ['contact', 'addresses']);

// POST an object
// PUT an object
// DELETE an object
```


# TODO

- [ ] setup testing stuff automatically or with a blueprint
- [ ] reset store after each test
- [ ] `stub` POST api
- [ ] `stub` PUT api
- [ ] `stub` DELETE api
- [ ] write tests for my testing library that helps you test
