# Serializers

A serializer is an object responsible for transforming a Model or Collection that's returned from your route handlers

```js
this.get('movies/:id', (schema, request) => {
  return schema.movies.find(request.params.id);
});
```

into a formatted JSON payload

```js
// GET /movies/1

{
  data: {
    id: '1',
    type: 'movies';,
    attributes: {
      title: 'Interstellar'
    }
  }
}
```

suitable for consumption by your Ember app.

Serializers are the last main part of Mirage's architecture that interacts with the Data Layer, because producing a well-formatted JSON response often involves traversing the relationship graph of your models.

Let's see how they work.


## Choosing which serializer to use

The first step in working with Mirage's serializers is to choose which included serializer to start with, which in turn depends on what JSON format your backend uses to serve data to your Ember app.

The JSON payload above is an example of an API that follows [the JSON:API spec](https://jsonapi.org/). You'll see it used a lot in the Ember ecosystem, because it's the default API format expected by Ember Data. It also solves a lot of problems that exist in other formats that are less well-defined.

If you are starting a new app, it's recommended that you choose a JSON:API implementation for your backend, as that format will give you the smoothest experience with the rest of the Ember ecosystem. However, plenty of Ember apps are built that don't use JSON:API.

If your app does use JSON:API, Mirage ships with a `JSONAPISerializer` that will do the heavy lifting for you.

Mirage also ships with two other named serializers, `ActiveModelSerializer` and `RestSerializer`, that match two other popular backend formats.

If your backend uses a different format, you'll need to choose the closest one and customize it to match your production format. We'll talk about that later in this guide.


## Defining serializers

Once you've selected the appropriate serializer, define your default application-wide serializer by exporting it from `/mirage/serializers/application.js`:

```js
// mirage/serializers/application.js
import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
});
```

This specifies the serializer to use for each Model and Collection in your system.

If you need to customize a serializer for a particular model type, you can define model-specific serializers that take precedence over your application serializer.

Let's use Mirage's generator to create a `Movie` serializer:

```
ember g mirage-serializer movie
```

This creates the file

```js
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
});
```

which follows the best practice of model-specific serializers extending from your Application serializer.

You can now customize the behavior of how `Movie` models and collections are serialized into JSON.


## Customizing serializers

When it comes to customizing your application's serializers, you'll mostly be tweaking Mirage's defaults.

For example, if your Ember app expects attribute names to be PascalCase

```js
// GET /movies/1

{
  Id: '1',
  ReleaseDate: 'Interstellar'
}
```

you might override the Serializer's `keyForAttribute` method:

```js
import { Serializer } from 'ember-cli-mirage';
import { classify } from '@ember/string';

export default Serializer.extend({

  keyForAttribute(attr) {
    return classify(attr);
  }

});
```

See the API docs for each serializer to learn more about all the customization hooks available.


## Relationships

Relationships are another important aspect of Serializers, as backends have many different ways of dealing with relationships.

For example, the `JSONAPISerializer` respects query param includes

```
GET /movies/1?include=cast-members
```

out of the box. But sometimes Ember apps expect a resource payload to have all their relationship IDs defined, regardless if the request used query param includes.

There's an option on `JSONAPISerializer` that enables this:

```js
import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({

  alwaysIncludeLinkageData: true

});
```

Now, a GET request to `/movies/1` would respond with this payload:

```js
{
  data: {
    id: '1',
    type: 'movies';,
    attributes: {
      title: 'Interstellar'
    },
    relationships: {
      'cast-members': {
        data: [
          { type: 'people', id: '1' },
          { type: 'people', id: '2' },
          { type: 'people', id: '3' },
        ]
      }
    }
  }
}
```

The Ember app could now use these ids to subsequently fetch the related cast members.

Other times, an Ember app expects to get a link to fetch related data. The `JSONAPISerializer` also has a hook for this:

```js
// mirage/serializers/movie.js
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(movie) {
    return {
      'cast-members': {
        related: `/api/movies/${movie.id}/cast-members`
      }
    };
  }

});
```

Now a GET request to `/movies/1` would respond with this payload:

```js
{
  data: {
    id: '1',
    type: 'movies';,
    attributes: {
      title: 'Interstellar'
    },
    relationships: {
      'cast-members': {
        links: {
          related: `/api/movies/1/cast-members`
        }
      }
    }
  }
}
```

The other serializers also have mechanisms controlling how related data can be loaded. Be sure to check out the API docs for all the details.


## Working with serialized JSON

While most route handlers should return a Model or Collection instance, and leave the serialization logic up to the Serializer, sometimes it can be convenient to perform some final serialization logic directly in your route handler.

You can use the `this.serialize` helper method to do this.

```js
// mirage/config.js
this.get('/movies', (schema, request) => {
  let movies = schema.movies.all();
  let json = this.serialize(movies);

  json.meta.size = movies.length;

  return json;
});
```

The `serialize` helper will use the typical lookup logic to first check for a model-specific serializer, and then fall back to the default Application serializer.

You can also use a specific serializer if you have a special case by passing in the name of the serialize as a second argument:

```js
// mirage/config.js
this.get('/movies', (schema, request) => {
  let movies = schema.movies.all();
  let json = this.serialize(movies, 'movie-with-relationship');

  json.meta.size = movies.length;

  return json;
});
```

This route handler would use the `mirage/serializers/movie-with-relationship.js` serializer to transform the collection of movies into a `json` payload, which is then modified and then finally returned from the route handler.


---

In general, you should not need to write much code dealing with Mirage serializers. Even if your backend doesn't adhere to one of the predefined formats, you should be able to use the provided hooks to implement an ApplicationSerializer that works for the majority of your models.

The more conventional your backend API is, the less code you'll need to write – not only in Mirage, but also in other parts of your Ember application!

Be sure to check out the {{docs-link 'Serializer' 'docs.api.item' 'modules/ember-cli-mirage/serializer~Serializer#keyForAttribute'}} and {{docs-link 'JSONAPISerializer' 'docs.api.item' 'modules/ember-cli-mirage/serializers/json-api-serializer~JSONAPISerializer'}} docs to learn about all the hooks available to customize your serializer layer.

Now that we've covered the ins and outs of Mirage's data layer, we're ready to see how we can use Mirage to effectively test our Ember application.
