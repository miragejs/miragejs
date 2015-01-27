# Ember Pretenderify

Share your Pretender server across testing and development in your Ember CLI apps.

---- WARNING: this is a spike. you probably shouldn't use it

- Tired of writing one set of mocks for your tests, and another for development?
- Love Pretender but hate wiring up every app manually?

Ember Pretenderify may be for you! It lets you share your [Pretender]() server in both development and in testing. It only uses Pretender if you're not in production and if you're not explicitly proxying to a different API server via `ember serve --proxy`.

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

That's it! Now if you run `ember s` (and don't pass a `--proxy` option), or during testing, your app will get this response whenever it makes a GET request to `/api/contacts`.

*Convenience methods*

There are some convenience methods bundled to make writing your server easier. The full API is below, but here's an example of using **stub**:

```
// app/pretender/config.js
export default function() {

  this.stub('get', 'api/contacts', function(request) {
    var contacts = [{id: 1, name: 'Zelda'}];

    // response code defaults to 200
    return {
      data: contacts
    };
  });

  // Or, if you already have the data
  var contacts = [{id: 1, name: 'Zelda'}];
  this.stub('get', 'api/contacts', contacts);
};
```

*Adding some structure*

You can use Pretender's API and structure your routes and data however you please, but the goal of this project is to converge on a single organizational strategy.

To play along, create the file `app/pretender/data/index.js` and create your data in files under this new `/data` folder. Export all your data from `/data/index.js`, like this:

```
// app/pretender/datacontacts.js
export default [
  {
    id: 1,
    name: 'Zelda'
  }
];

// app/pretender/data/index.js
import contacts from '.contacts';

export default {
  contacts: contacts
}
```

Now, this data will be attached to your Pretender server via `server.data`. If you stick to using and mutating the data attached here, your Pretender server's state will update to reflect user interactions, essentially acting as a real server while you click around in development.

Here's an example `app/pretender/config.js` file using this setup:

```
export default function() {
  var server = this;

  this.stub('get', 'contacts', {
    contacts: server.data.contacts
  });
};
```

In testing environments, the data attached to `server.data` will be reset at the end of each test.

## Default config

These options can be overridden in your `/pretender/config.js` file.

- Content returned is JSON stringified, so you don't have to do this yourself.

*Example*

Here's an example using the `stub` convenience method, described below:

```
// app/pretender/index
import users from './data/users';

export default function() {
  this.stub('get', 'users', users);

  this.stub('get', 'products', function(request) {
    var products = [1, 2, 2];

    return {data: products, code: 200}
  });
};
```


## Convenience methods

There are some additional convenience methods available.

**#stub**

Sets content type to 'application/json', and lets you simply pass data as the third argument if you don't need to do any additional work.

```
this.stub(verb, path, data);
this.stub(verb, path, function() {
  return {data: data}; // status code defaults to 200
});
this.stub(verb, path, function() {
  return {data: data, code: 500};
});
```
