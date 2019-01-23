# Defining routes

To define routes for your server, use the `get`, `post`, `put` (or `patch`) and `del` methods. Here's an example:

```js
// mirage/config.js
this.get('/authors', () => {
  return ['Link', 'Zelda', 'Epona'];
});
```

Now when your Ember app makes a GET request to `/authors`, it will receive this data.

Each verb method has the same signature. The first argument is the path (URL) and the second is the actual function handler that returns the response:

<p class='u-callout'>this.<strong>verb</strong>( <em>path</em>, <em>handler</em> )</p>

Here are some more examples:

```js
this.get('/users/current', () => {
  return {
    name: 'Zelda',
    email: 'z@hyrule.org'
  };
});

this.get('/events', () => {
  let events = [];
  for (let i = 1; i < 1000; i++) {
    events.push({id: i, value: Math.random()});
  };

  return events;
});
```


## Working with Models

In the examples above, we wrote the response data directly in the route. Instead of doing this, Mirage provides a simple in-memory database you can use to make your routes more versatile.

In previous versions of Mirage, you interacted with the database directly in your route handlers. Models were introduced as a wrapper around the database to provide better means for dealing with associations and formatting responses, which we'll get to shortly. For now, it's enough to know that models are the primary way you interact with Mirage's database.

So, let's first define an `author` model. We can do this from the command line:

```sh
ember g mirage-model author
```

This gives us the file

```js
// mirage/models/author.js
import { Model } from 'ember-cli-mirage';

export default Model;
```

which sets up our database (at run-time) with an `authors` table. Now we can rewrite our route handler to use the model.

A `schema` object is injected into each route handler as the first parameter, which is how we access our models. Let's use it to make this route dynamic:

```js
// mirage/config.js
this.get('/authors', (schema) => {
  return schema.authors.all();
});
```

<aside class='Docs-page__aside'>
  <p>You'll learn how to seed your database with initial data in the next section.</p>
</aside>

Now, Mirage will respond to this route with all the `author` models in its database.

You can also create, update and delete models from your route handlers. A `request` object is injected as the second parameter, which contains any data that was sent along with the request.

Let's say your Ember app creates an author by sending a POST request with the following payload:

```
{
  author: {
    name: 'Link',
    age: 123
  }
}
```

We can use this data to create a new `author` model:

```js
this.post('/authors', (schema, request) => {
  const attrs = JSON.parse(request.requestBody).author;

  return schema.authors.create(attrs);
});
```

This handler creates a new author, inserts it into the database (which assigns it an `id`), and responds with that record.

<aside class='Docs-page__aside'>
  <p>View the <a href="../models">full Model API</a> to see how your routes can interact with your data.</p>
</aside>

As long as all your Mirage routes read from and write to the database, user interactions will persist during a single session. This lets users interact with your app as if it were wired up to a real server.


## Dynamic paths and query params

The request object that's injected into your route handlers contains any dynamic route segments and query params.

To define a route that has a dynamic segment, use colon syntax (`:segment`) in your path. The dynamic piece will be available via `request.params.[segment]`:

```js
this.get('/authors/:id', (schema, request) => {
  var id = request.params.id;

  return schema.authors.find(id);
})
```

Query params from the request can also be accessed via `request.queryParams.[param]`.

Mirage uses Pretender.js to intercept HTTP requests, so check out [its docs](https://github.com/trek/pretender) to see the full API for the request object.


## Using shorthands

APIs have become more standardized, so Mirage has the concept of *shorthands* to deal with common scenarios. These shorthands can replace many of your custom route handlers, dramatically simplifying your server definition.

For example, the route handler we wrote above to handle a GET request to `/authors`

```js
this.get('/authors', (schema, request) => {
  return schema.authors.all();
});
```

is pretty standard: it responds with a named collection. The shorthand form of this is

```js
this.get('/authors');
```

which infers the collection name from the last part of the URL. Returning a single author by id is just as easy:

```js
this.get('/authors/:id');
```

Similarly, we wrote a route handler by hand to deal with creating an author

```js
this.post('/authors', (schema, request) => {
  const attrs = JSON.parse(request.requestBody).author;

  return schema.authors.create(attrs);
});
```

which is also pretty standard: it creates a new model using the attributes from the request payload. The equivalent shorthand is

```js
this.post('/authors');
```

View the [full reference](../shorthands) to see all available shorthands.


## Formatting your response with Serializers

When you return a model or a collection from a route handler, Mirage *serializes* it into a JSON payload, and then responds to your Ember app with that payload. It uses an object called a Serializer to do this, which you can customize. Having a single object that's responsible for this formatting logic helps keep your route handlers simple. In particular, a bit of customization in the serializer layer often lets you use shorthands when you otherwise wouldn't be able to.

Mirage ships with three named serializers, JsonApiSerializer (used to implement [JSON:API](http://jsonapi.org/)), ActiveModelSerializer (used to simulate Rails servers using ActiveModel::Serializers) and RestSerializer (use to match Ember Data’s RestSerializer expected response format). You should use these if your app's backend will be built to conform to either standard.

Additionally, there's a basic Serializer class that you can use and customize. By default, it takes all the attributes of your model, and returns them under a root key of the model type. Suppose you had the following author in your database:

```
{
  id: 1,
  firstName: 'Keyser',
  lastName: 'Soze'
  age: 145
}
```

and you had this route

```js
this.get('/authors/:id');
```

The response would look like this:

```
GET /authors/1

{
  author: {
    id: 1,
    firstName: 'Keyser',
    lastName: 'Soze',
    age: 145
  }
}
```

Remember, your Mirage server should mimic your backend server. Let's say your backend server returns dasherized object keys instead of camel cased. You can customize the response by extending the base Serializer and overwriting `keyForAttribute`:

```js
// mirage/serializers/application.js
import { Serializer } from 'ember-cli-mirage';
import Ember from 'ember';

const { dasherize } = Ember.String;

export default Serializer.extend({

  keyForAttribute(key) {
    return dasherize(key);
  }

});
```

Now, without having to edit your route handler, the response would look like this:

```
GET /authors/1

{
  author: {
    id: 1,
    'first-name': 'Keyser',
    'last-name': 'Soze',
    age: 145
  }
}
```

Just like in Ember, the `serializers/application.js` file will apply to all your responses. You can also create per-model serializers, for example to include only some attributes:

```js
// mirage/serializers/author.js
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attributes: ['firstName']

});
```

View the [full Serializer API](../serializers) to learn more about customizing your responses.


## Associations

You can define associations between your models, which makes dealing with related data easier. For example, let's say an author has many posts, and when you delete an author your server also deletes all the related posts.

We can define the relationship on our author model:

```js
// mirage/models/author.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  posts: hasMany()
});
```

`hasMany` tells Mirage to manage a `postIds: []` array on our author model. Now, our route handler for deleting an author looks like this:

```js
this.del('/authors/:id', (schema, request) => {
  let author = schema.authors.find(request.params.id);

  author.posts.delete();
  author.delete();
});
```

A response with DELETE's default status code of 200 would then be returned.

Associations are also useful in combination with serializers. With the relationship defined above on our `author` model, we can use a shorthand and a custom serializer to sideload an author's related posts:

```js
// mirage/config.js
this.get('/authors/:id');

// mirage/serializers/author.js
import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  include: ['posts']
});
```

Now a request for an author responds with the following:

```
GET /authors/1

{
  author: {
    id: 1,
    name: 'Link'
  },
  posts: [
    {id: 1, authorId: 1, title: "The Beauty of Hyrule"},
    {id: 2, authorId: 1, title: "Really, I'm an Elf!"},
    {id: 3, authorId: 1, title: "Ganondorf is my Father"}
  ]
}
```

<aside class='Docs-page__aside'>
  <p>camelCased attributes let you stick to conventional JavaScript when working with models in your route handler and scenario code.</p>
</aside>

Mirage's database uses camelCase for all model attributes, including foreign keys (e.g. `authorId` in the example above), but you can customize the format that gets sent in the response by overwriting your serializer's `keyForRelatedCollection`. See [the serializer guide](../serializers) for more details.


## Dynamic status codes and HTTP headers

By default, Mirage sets the HTTP code of a response based on the verb being used:

  - `get`, `put` and `del` are 200
  - `post` is 201


Additionally, a header for `Content-Type` is set to `application/json`.

You can customize both the response code and headers by returning a `Response` in your route handler:

```js
// mirage/config.js
import { Response } from 'ember-cli-mirage';

export default function() {
  this.post('/authors', function(schema, request) {
    let attrs = JSON.parse(request.requestBody).author;

    if (attrs.name) {
      return schema.authors.create(attrs);
    } else {
      return new Response(400, {some: 'header'}, {errors: ['name cannot be blank']});
    }
  });
}
```


## Fully qualified URLs

Route handlers for paths without a domain (e.g. `this.get('/authors')`) work for requests that target the current domain. To simulate other-origin requests, specify the fully qualified URL for your route handler:

```js
this.get('https://api.github.com/users/samselikoff/events', () => {
  return [];
});
```

---

That's the essentials of defining your routes. Next, you'll learn how to seed your database with some starting data, both in development and within tests.
