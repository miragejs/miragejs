# Fixtures

Mirage also lets you use flat fixture files to seed your database with data.

In general, we recommend using factories for most situations, since they tend to keep your mock data more maintainable. But there are certainly times where fixture data makes sense.

Fixtures are nothing more than a conventional file-based way to accomplish the following:

```js
// mirage/scenarios/default.js
export default function(server) {
  server.db.loadData({
    countries: [
      { id: 1, name: 'China' },
      { id: 2, name: 'India' },
      { id: 3, name: 'United States' }
    ]
  });
}
```

Let's see how we can do the same thing using fixtures.


## Basic usage

We'll start by generating a fixture file for our `Country` model:

```
ember g mirage-fixture countries
```

Fixture filenames should be the dasherized plural form of the model class.

We can now add some data to our fixture file:

```js
// mirage/fixtures/countries.js
export default [
  { id: 1, name: 'China', largestCity: 'Shanghai' },
  { id: 2, name: 'India', largestCity: 'Mumbai' },
  { id: 3, name: 'United States', largestCity: 'New York City' },
  { id: 4, name: 'Indonesia', largestCity: 'Jakarta' },
  { id: 5, name: 'Pakistan', largestCity: 'Karachi' },
  { id: 6, name: 'Brazil', largestCity: 'São Paulo' },
  { id: 7, name: 'Nigeria', largestCity: 'Lagos' },
  { id: 8, name: 'Bangladesh', largestCity: 'Dhaka' },
  { id: 9, name: 'Russia', largestCity: 'Moscow' },
  { id: 10, name: 'Mexico', largestCity: 'Mexico City' },
];
```

Because this data will be read directly into Mirage's database, we want to use camelCase for all multi-word attributes. (Mirage uses the camelCasing convention to avoid configuration for things like identifying foreign keys.)

Don't worry if your production API format doesn't use camelCase. We'll be able to customize Mirage's API format in the Serializer layer.

To load our new fixture file into the database during development, we can call `server.loadFixtures` in our `scenarios/default.js` file:

```js
// mirage/scenarios/default.js
export default function(server) {
  server.loadFixtures();
}
```

If we have multiple fixtures defined, `server.loadFixtures()` will load every file. You can load files selectively by passing in an argument list of fixture names to `loadFixtures`:

```js
// mirage/scenarios/default.js
export default function(server) {
  server.loadFixtures('countries', 'cities'); // only load the countries and cities fixtures
}
```

Just like with factories, fixtures will be ignored during tests. If you want to load fixture data in a test, you can call `this.server.loadFixtures`:

```js
test('I can see the countries', async function(assert) {
  this.server.loadFixtures('countries');

  await visit('/');

  assert.dom('option.country').exists({ length: 100 });
});
```

## Relationships

There's no special API for creating relationships using fixtures – you just need to understand how Mirage uses foreign keys to wire up relationships.

Let's say we had these models:

```js
// mirage/models/user.js
export default Model.extend({
});

// mirage/models/post.js
export default Model.extend({
  author: belongsTo('user')
});
```

Using the ORM we can create two related models:

```js
let chris = schema.users.create({ name: 'Chris Garrett' });

schema.posts.create({
  author: chris,
  title: 'Coming Soon in Ember Octane'
});
```

If we take a look at Mirage's database after this, we'll see this data:

```js
// server.db.dump()
{
  users: [
    { id: '1', name: 'Chris Garrett' }
  ],
  posts: [
    { id: '1', authorId: '1', title: 'Coming Soon in Ember Octane' }
  ]
}
```

As you can see, Mirage added an `authorId` foreign key to the post. The convention for belongsTo foreign keys is

```js
`${relationshipName}Id`
```

In this case, a post gets an `authorId`, even though that relationship points to a `User` model. The relationship name is always used rather than the model name, because models can have multiple relationships that point to the same type of model.

Looking at the database dump above, if you wanted to recreate the same relationship graph using only fixture files, your files would look something like this:

```js
// mirage/fixtures/users.js
export default [
  { id: '1', name: 'Chris Garrett' }
];

// mirage/fixtures/posts.js
export default [
  { id: '1', authorId: '1', title: 'Coming Soon in Ember Octane' }
];
```

Once these fixtures are loaded into Mirage, all the ORM methods, Shorthands and Serializers would work as expected.

If this happens to be a bi-directional relationship

```diff
  // mirage/models/user.js
  export default Model.extend({
+   posts: hasMany()
  });

  // mirage/models/post.js
  export default Model.extend({
    author: belongsTo('user')
  });
```

then Mirage will add an array of foreign keys on the new hasMany association:

```js
// mirage/fixtures/users.js
export default [
  { id: '1', postIds: [ '1' ], name: 'Chris Garrett' }
];

// mirage/fixtures/posts.js
export default [
  { id: '1', authorId: '1', title: 'Coming Soon in Ember Octane' }
];
```

The convention for hasMany relationship foreign keys is

```js
`${singularize(relationshipName)}Ids`
```

All associations have their own keys, because Mirage supports arbitrary one-way relationships. If two associations are inverses of each other, as in the above case, Mirage will keep the keys on each model in sync provided you use the ORM methods.

As you can see, maintaining foreign keys and keeping them in sync across fixture files can get a little messy, which is why Mirage recommends using factories for most of your data creation.

Still, fixtures can be quite useful in certain situations, so they're a good tool to have in your toolbox.

---
