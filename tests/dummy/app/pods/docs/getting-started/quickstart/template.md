# Quickstart

Mirage is all about simulating your API server. You define *route handlers* to respond to your Ember app's AJAX requests.

Here's a simple example of a handler:

```js
// mirage/config.js
export default function() {
  this.namespace = 'api';

  this.get('/authors', () => {
    return {
      authors: [
        {id: 1, name: 'Zelda'},
        {id: 2, name: 'Link'},
        {id: 3, name: 'Epona'},
      ]
    };
  });

}
```

Now whenever your Ember app makes a GET request to `/api/authors`, Mirage will respond with this data.

## Dynamic data

This works, and is a common way to simulate HTTP responses - but hard-coded responses like this have a few problems:

   - *They're inflexible*. What if you want to change this route's response data in your tests?
   - *They contain formatting logic*. Logic that formats the shape of your JSON payload (e.g., including the root `authors` key) is now duplicated across all your route handlers.
   - *They're too basic.* Inevitably, when your fake server needs to deal with more complex things like relationships, these simple ad hoc responses start to break down.

Mirage provides primitives that let you write a more flexible server implementation. Let's see how they work by replacing our basic stub data above.

First, create an `author` model by running the following in your terminal:

```bash
$ ember g mirage-model author
```

This generates the following file:

```js
// mirage/models/author.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({
});
```

The model will create an `authors` table in Mirage's *in-memory database*. The database makes our route handlers dynamic&mdash;we can change the returned data without rewriting the handler. In this way, we can share the same route definitions in both development and testing, while still having control over their response data.

Let's update our route handler to be dynamic:

```js
// mirage/config.js
this.namespace = 'api';

this.get('/authors', (schema, request) => {
  return schema.authors.all();
});
```

Now this route will respond with all the authors in Mirage's database at the time of the request. If we want to change the data this route responds with, we simply need to change the data in the database.

## Creating data

<aside class='Docs-page__aside'>
  <p>You can also use flat fixture files to seed your database. Learn more in the <a href="../seeding-your-database">database guide</a>.</p>
</aside>

To actually seed our database with fake data, we'll use *factories*. Factories are objects that dynamically generate data - think of them as blueprints for your models.

Let's create a factory for our author with

```sh
$ ember g mirage-factory author
```

Mirage also includes the Faker.js library. Let's use this in the Factory and add some properties to it:

```js
// mirage/factories/author.js
import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  name(i) {
    return `Person ${i}`;
  },

  age: 28,

  admin: false,

  avatar() {
    return faker.internet.avatar();
  }

});
```

This factory creates objects like

```javascript
[{
  name: 'Person 1',
  age: 28,
  admin: false,
  avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/bergmartin/128.jpg'
},
{
  name: 'Person 2',
  age: 28,
  admin: false,
  avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/nemanjaivanovic/128.jpg'
}]
```

and so on, which will automatically be inserted into the `authors` database table. The database will assign each record an `id`, and now we can interact with this data in our route handlers.

To use our new factory, we can call the `server.create` and `server.createList` methods in development:

```js
// mirage/scenarios/default.js
export default function(server) {

  server.createList('author', 10);

};
```

and in acceptance tests:

```js
// tests/acceptance/authors-test.js
test("I can view the authors", function() {
  let authors = server.createList('author', 3);

  visit('/authors');

  andThen(() => {
    equal(find('li').length, 3);
    equal(find('li:first').text(), authors[0].name);
  });
});
```

You now have a simple way to set up your fake server's initial data, both during development and on a per-test basis.

## Associations and serializers

Dealing with associations is always tricky, and faking endpoints that deal with associations is no exception. Fortunately, Mirage ships with an ORM to help keep your routes clean.

Let's say your author has many blog-posts. You can declare this relationship in your model:

```js
// mirage/models/author.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  blogPosts: hasMany()
});

// mirage/models/blog-post.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  author: belongsTo()
});
```

Now Mirage knows about the relationship between these two models, which can be useful when writing route handlers:

```js
this.get('/authors/:id/blog-posts', (schema, request) => {
  let author = schema.authors.find(request.params.id);

  return author.blogPosts;
});
```

and when creating graphs of related data:

```js
test('I can see the posts on the homepage', function(assert) {
  let author = server.create('author');
  server.createList('post', 10, { author });

  visit('/');

  andThen(() => {
    assert.expect(find('li').length, 10);
  });
});
```

Mirage's serializer layer is also aware of your relationships, which helps when faking endpoints that sideload or embed related data. Models and Collections that are returned from a route handler pass through the serializer layer, where you can customize which attributes and associations to include, as well as override other formatting options:

```js
// mirage/serializers/application.js
import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  keyForAttribute(attr) {
    return dasherize(attr);
  },

  keyForRelationship(attr) {
    return dasherize(attr);
  },
});

// mirage/serializers/author.js
import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  include: ['blogPosts']
});

// mirage/config.js
export default function() {
  this.get('/authors/:id', (schema, request) => {
    return schema.authors.find(request.params.id);
  });
}
```

With the above config, a GET to `/authors/1` would return something like

```
/*
{
  author: {
    id: 1,
    'first-name': 'Zelda'
  },
  'blog-posts': [
    {id: 1, 'author-id': 1, title: 'Lorem ipsum'},
    ...
  ]
}
*/
```

Mirage ships with two named serializers, JSONAPISerializer and ActiveModelSerializer, to save you the trouble of writing this custom code yourself. See the [serializer guide](../serializers) to learn more.

## Shorthands

<aside class='Docs-page__aside'>
  <p>View more <a href="../shorthands">shorthands</a>.</p>
</aside>

Mirage has *shorthands* to reduce the code needed for conventional API routes. For example, the route handler

```js
this.get('/authors', (schema, request) => {
  return schema.authors.all();
});
```

can be written as

```js
this.get('/authors');
```

There are also shorthands for `put` (or `patch`), `post` and `del` methods. Here's a full set of resourceful routes for an `author` resource:

```js
this.get('/authors');
this.get('/authors/:id');
this.post('/authors');
this.put('/authors/:id'); // or this.patch
this.del('/authors/:id');
```

Shorthands make writing your server definition concise, so you should use them whenever possible. You can always fall back to a custom function when you need more control.

## Passthrough

Mirage is a great tool to use even if you're working on an existing app, or if you don't want to fake your entire API. By default, Mirage throws an error if your Ember app makes a request that doesn't have a corresponding route handler defined. To avoid this, tell Mirage to let unhandled requests pass through:

```js
// mirage/config.js
this.passthrough();
```

Now you can develop as you normally would, for example against an existing API.

When it comes time to build a new feature, you don't have to wait for the API to be updated. Just define the new route that you need

```js
// mirage/config.js
this.get('/comments');

this.passthrough();
```

and you can fully develop and test the feature. In this way you can build up your fake server piece by piece - adding some solid acceptance tests along the way.

---

That should be enough to get you started! Keep reading to learn more.
