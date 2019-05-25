# The ORM

Mirage originally shipped with just a database as its data layer. While helpful, users still had to write a lot of code to reproduce their modern, complex backends. In particular, dealing with relationships was a big pain point.

The solution was to add an Object Relational Mapper, or ORM, to Mirage.

Let's see how an ORM allows Mirage to do more of the heavy lifting for you.


## Motivation

Consider a database that looks like this:

```js
db.dump();

// Result
{
  movies: [
    { id: '1', title: 'Interstellar' },
    { id: '2', title: 'Inception' },
    { id: '3', title: 'Dunkirk' }
  ]
}
```

The first problem you'll encounter when writing a route handler is how to transform this raw data into the format your Ember app expects – that is, how to match the format of your production API.

Let's say your backend uses [the JSON:API spec](https://jsonapi.org/). Your response to a GET request for `/api/movies/1` should look something like this:

```js
// GET /api/movies/1
{
  data: {
    id: '1',
    type: 'movies',
    attributes: {
      title: 'Interstellar'
    }
  }
}
```

Not a huge deal – we could just write this formatting logic directly in our route handler:

```js
this.get('/movies/:id', (schema, request) => {
  let movie = schema.db.movies.find(request.params.id);

  return {
    data: {
      id: movie.id,
      type: 'movies',
      attributes: {
        title: movie.title
      }
    }
  };
});
```

This works. But let's say our `Movie` model had a few more attributes:

```js
{
  id: '1',
  title: 'Interstellar',
  releaseDate: 'October 26, 2014',
  genre: 'Sci-Fi'
}
```

Now our route handler needs to be more clever, and make sure all properties other than `id` end up in the `attributes` hash:

```js
this.get('/movies/:id', (schema, request) => {
  let movie = schema.db.movies.find(request.params.id);
  let movieJSON = {
    data: {
      id: movie.id,
      type: 'movies',
      attributes: { }
    }
  };
  Object.keys(movie)
    .filter(key => key !=== 'id')
    .forEach(key => {
      movieJSON[key] = movie[key];
    });

  return movieJSON;
});
```

As you can see, things get complicated pretty fast.

What if we add relationships to the mix? Let's say a `Movie` has a relationship to a `director`, and it stores that relationship using a `directorId` foreign key:

```js
{
  id: '1',
  title: 'Interstellar',
  releaseDate: 'October 26, 2014',
  genre: 'Sci-Fi',
  directorId: '23'
}
```

The expected HTTP response for this model now looks like this

```js
{
  data: {
    id: '1',
    type: 'movies',
    attributes: {
      title: 'Interstellar'
    },
    relationships: {
      directors: {
        data: { type: 'people', id: '23' }
      }
    }
  }
}
```

meaning our route handlers need to get even more complex. In particular, they need a robust way to differentiate between a model's attributes (like `title`) and its relationship keys (like `directorId`).

These sorts of problems turn out to be common enough that we can solve them generally, provided Mirage is aware of your application's models and their relationships.


## Problems solved by the ORM

When Mirage knows about your application's domain, it can shoulder the responsibility for the low-level bookkeeping work needed to properly implement your mock server.

Let's take a look at some examples of how it does this.


### Separation of formatting logic

To start, we can tell Mirage about our application's schema by defining Mirage models. These models get registered with the ORM and tell Mirage about the shape of your data.

Let's define a `Movie` model.

```js
// mirage/models/movie.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({
});
```

Mirage models are _schemaless in attributes_, in that they don't require you to define plain attributes like `title` and `releaseDate`. So, the above model definition works regardless of what attributes your `Movie` model has.

If you're using Ember Data, Mirage's ORM will automatically register your Ember Data models for you at run time, so you don't have to duplicate your domain information in two places.

With the `Movie` model defined, we can update our route handler to use the ORM to respond with a Mirage model instance:

```js
this.get('/movies/:id', (schema, request) => {
  let id = request.params.id;

  return schema.movies.find(id);
});
```

The `schema` argument is how you interact with the ORM.

By returning an instance of a Mirage model from a route handler instead of a plain JavaScript object, we can now take advantage of Mirage's Serializer layer. Serializers work by turning Models and Collections into formatted JSON responses.

Mirage ships with a JSONAPISerializer out of the box, so assuming it's defined as your Application serializer

```js
// mirage/serializers/application.js
import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
});
```

this route handler will now respond with the payload we expect:

```js
{
  data: {
    id: '1',
    type: 'movies',
    attributes: {
      title: 'Interstellar',
      releaseDate: 'October 26, 2014',
      genre: 'Sci-Fi'
    }
  }
}
```

The ORM is already helping us keep our route handlers tidy by delegating the work of transforming our models into JSON to the Serializer layer.

But it gets even more powerful when we add relationships to the mix.


### Fetching related data

Let's say our `Movie` has a belongs-to relationship with a `director`:

```js
// mirage/models/movie.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({

  director: belongsTo('person')

});
```

The `director` is an instance of a `Person` model:

```js
// mirage/models/person.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({
});
```

Again, if you're using Ember Data, both the models and relationships will be automatically generated for you. No need to create this file.

Without changing anything about our route handler or serializer, we can now fetch a graph of data by using JSON:API includes.

The following request

```
GET /api/movies/1?include=director
```

will now generate this response:

```js
{
  data: {
    id: '1',
    type: 'movies',
    attributes: {
      title: 'Interstellar',
      releaseDate: 'October 26, 2014',
      genre: 'Sci-Fi'
    },
    relationships: {
      director: {
        data: { type: 'people', id: '1' }
      }
    }
  },
  included: [
    {
      id: '1',
      type: 'people',
      attributes: {
        name: 'Christopher Nolan'
      }
    }
  ]
}
```

The JSONAPISerializer is able to inspect the ORM so that it can put all models, attributes and relationships in the right place. Our route handler doesn't need to change at all.

In fact, the route handler we wrote is the same as the default behavior of the Shorthand, meaning we can just switch to using that:

```diff
- this.get('/movies/:id', (schema, request) => {
-   let id = request.params.id;

-   return schema.movies.find(id);
- });
+ this.get('/movies/:id');
```

This is another example of how the ORM helps various parts of Mirage, like Shorthands and Serializers, work together to simplify your server definition.


### Creating and editing related data

The ORM also makes creating and editing related data easier than if you only worked with the raw database records.

For instance, to create a `Movie` and `Person` with a relationship using only the database, you'd need to do something like this:

```js
server.db.loadData({
  people: [
    {
      id: '1',
      name: 'Christopher Nolan'
    }
  ],
  movies: [
    {
      id: '1',
      title: 'Interstellar',
      releaseDate: 'October 26, 2014',
      genre: 'Sci-Fi',
      directorId: '1'
    }
  ]
});
```

Note the `directorId` foreign key on the `Movies` record must match the `id` on the associated `People` record.

Managing raw database data like this quickly gets unwieldy, especially as relationships change over time.

Using the ORM via `server.schema`, we can create this graph without managing any IDs:

```js
let nolan = schema.people.create({ name: 'Christopher Nolan' });

schema.movies.create({
  director: nolan,
  title: 'Interstellar',
  releaseDate: 'October 26, 2014',
  genre: 'Sci-Fi'
});
```

Passing in the model instance `nolan` as the `director` attribute when creating the movie is enough for all the keys to be properly set up.

The ORM also keeps foreign keys in sync as relationships are edited. Given the database

```js
{
  movies: [
    {
      id: '1',
      title: 'Star Wars: The Rise of Skywalker',
      directorId: '2'
    }
  ],
  people: [
    {
      id: '2',
      name: 'Rian Johnson'
    },
    {
      id: '3',
      name: 'J.J. Abrams'
    }
  ]
}
```

we could update the movie's director like this:

```js
let episode9 = schema.movies.findBy({
  title: 'Star Wars: The Rise of Skywalker'
});

episode9.update({
  director: schema.people.findBy({ name: 'J.J. Abrams' });
});
```

The new database would look like this:

```js
{
  movies: [
    {
      id: '1',
      title: 'Star Wars: The Rise of Skywalker',
      directorId: '3'
    }
  ],
  people: [
    {
      id: '2',
      name: 'Rian Johnson'
    },
    {
      id: '3',
      name: 'J.J. Abrams'
    }
  ]
}
```

Note how the `directorId` was changed in the database, even though we only ever worked with model instances.

Importantly, this also holds true for more complex relationships, like one-to-many or many-to-many relationships that have an inverse.

The ORM allows Mirage to abstract all this bookkeeping away from your code, and even gives Shorthands enough power to respect arbitrary updates to complex relationship graphs.

---

These are some of the main problems addressed by Mirage's ORM. Generally, when Mirage knows about your application's models and their relationships, it can take on more of the responsibility of configuring your mock server.

Be sure to check out the {{docs-link 'Schema' 'docs.api.item' 'modules/ember-cli-mirage/orm/schema~Schema'}}, {{docs-link 'Model' 'docs.api.item' 'modules/ember-cli-mirage/orm/model~Model'}} and {{docs-link 'Collection' 'docs.api.item' 'modules/ember-cli-mirage/orm/collection~Collection'}} API docs to learn about all the available ORM methods, as well as the {{docs-link 'Association' 'docs.api.item' 'modules/ember-cli-mirage/orm/associations/association~Association'}} docs to see what methods are added by belongsTo and hasMany relationships.

We'll also cover Serializers in these guides, where you'll learn how to customize the serialized forms of your models and collections to match your production API.

Next, let's take a look at Factories, which also leverage the ORM to make it easy to create the relational data needed to put your server in a variety of states.
