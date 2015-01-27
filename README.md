# Ember Pretenderify

Share your Pretender server across testing and development in your Ember CLI apps.

---- WARNING: this is a spike

- Tired of writing one set of mocks for your tests, and another for development?
- Love Pretender but hate wiring up every app manually?

Ember Pretenderify may be for you! It lets you share your [Pretender]() server in both development and in testing. It only uses Pretender if you're not in production and if you're not explicitly proxying to a different API server via `ember serve --proxy`.

## Getting started

Create the file `app/pretender/index.js` and export a function. `this` inside the function refers to the Pretender server, so this is your chance to add routes, modify the default configuration, etc. Here's an example:

```
// app/pretender/index.js
export default function() {

  this.get('api/contacts', function(request) {
    var contacts = [{id: 1, name: 'Zelda'}];

    return [200, {}, contacts];
  });

};
```

That's it! Now if you run `ember s` (and don't pass a `--proxy` option), or during testing, your app will get this response whenever it makes a GET request to `/api/contacts`.

*Default config*

- Content returned is JSON stringified, so you don't have to do this yourself.
- Content type is 'application/json'

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

```
this.stub(verb, path, data);
this.stub(verb, path, function() {
  return {data: data}; // status code defaults to 200
});
this.stub(verb, path, function() {
  return {data: data, code: 500};
});
```
