# Factories

One of the main benefits of using Mirage is the ability to quickly put your server into different states.

For example, you might be developing a feature and want to see how the UI renders for both a logged-in user and an anonymous user. This is the kind of thing that's a pain when using a real backend server, but with Mirage it's as simple as flipping a JavaScript variable and live-reloading your Ember app.

**Factories** are classes that help you organize your data-creation logic, making it easier to define different server states during development or within tests.

Let's see how they work.

## Defining factories

### Your first factory

Say we have a `Movie` model defined in Mirage. (Remember, if you're using Ember Data you won't have this file on disk. The Model definition will be automatically generated for you.)

```js
// mirage/models/movie.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({
});
```

To seed Mirage's database with some movies so you can start developing your app, use the `server.create` method in the `scenarios/default.js` file:

```js
// mirage/scenarios/default.js
export default function(server) {

  server.create('movie');

}
```

`server.create` takes the singular hyphenated form of your model's class name as its first argument.

Because we have no Factory defined for a `Movie`, `server.create('movie')` will just create an empty record and insert it into the database:

```js
// server.db.dump();
{
  movies: [
    { id: '1' }
  ]
}
```

Not a very interesting record.

However, we can pass attributes of our own as the second argument to `server.create`:

```js
// mirage/scenarios/default.js
export default function(server) {

  server.create('movie', {
    title: 'Interstellar',
    releaseDate: '10/26/2014',
    genre: 'Sci-Fi'
  });

}
```

Now our database looks like this

```js
{
  movies: [
    {
      id: '1',
      title: 'Interstellar',
      releaseDate: '10/26/2014',
      genre: 'Sci-Fi'
    }
  ]
}
```

and we'll actually be able to develop our UI against realistic data.

This is a great way to start, but it can be cumbersome to manually define every attribute (and relationship) when working on data-driven applications. It would be nice if we had a way to dynamically generate some of these attributes.

Fortunately, that's exactly what Factories let us do!

Let's generate a Factory for our movie using

```
ember g mirage-factory movie
```

which creates this file:

```js
// mirage/factories/movie.js
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
});
```

Right now the Factory is empty. Let's define a property on it:

```js
// mirage/factories/movie.js
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  title: 'Movie title'

});
```

Now `server.create('movie')` will use the properties from this factory. The inserted record will look like this:

```js
{
  movies: [
    { id: '1', title: 'Movie title' }
  ]
}
```

We can also make this property a function.

```js
// mirage/factories/movie.js
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  title(i) {
    return `Movie ${i}`;
  }

});
```

`i` is an incrementing index that lets us make our factory attributes more dynamic.

If we use the `server.createList` method, we can quickly generate five movies

```js
server.createList('movie', 5);
```

and with the above factory definition, our database will look like this:

```js
{
  movies: [
    { id: '1', title: 'Movie 1' },
    { id: '2', title: 'Movie 2' },
    { id: '3', title: 'Movie 3' },
    { id: '4', title: 'Movie 4' },
    { id: '5', title: 'Movie 5' }
  ]
}
```

Let's add some more properties to our factory:

```js
// mirage/factories/movie.js
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  title(i) {
    return `Movie ${i}`;
  },

  releaseDate() {
    return faker.date.past().toLocaleDateString();
  },

  genre(i) {
    let genres = [ 'Sci-Fi', 'Drama', 'Comedy' ];

    return genres[i % genres.length];
  }

});
```

Here we've installed the [Faker.js](https://github.com/marak/Faker.js/) library to help us generate random dates.

Now `server.createList('movie', 5)` gives us this data:

```js
{
  movies: [
    { id: '1', title: 'Movie 1', releaseDate: '5/14/2018', genre: 'Sci-Fi' },
    { id: '2', title: 'Movie 2', releaseDate: '2/22/2019', genre: 'Drama' },
    { id: '3', title: 'Movie 3', releaseDate: '6/2/2018', genre: 'Comedy' },
    { id: '4', title: 'Movie 4', releaseDate: '7/29/2018', genre: 'Sci-Fi' },
    { id: '5', title: 'Movie 5', releaseDate: '6/30/2018', genre: 'Drama' },
  ]
}
```

As you can see, Factories let us rapidly generate different scenarios for our dynamic server data.


### Attribute overrides

Factories are great for defining the "base case" of your models, but there's plenty of times where you'll want to override attributes from your factory with specific values.

The last argument to `create` and `createList` accepts a POJO of attributes that will override anything from your factory.

```js
// Using only the base factory
server.create('movie');
// gives us this object:
{ id: '1', title: 'Movie 1', releaseDate: '01/01/2000' }

// Passing in specific values to override certain attributes
server.create('movie', { title: 'Interstellar' });
// gives us this object:
{ id: '2', title: 'Interstellar', releaseDate: '01/01/2000' }
```

Think of your factory attributes as a reasonable "base case" for your models, and then override them in development and testing scenarios as you have need for specific values.


### Dependent attributes

Attributes can depend on other attributes via `this` from within a function. This can be useful for quickly generating things like usernames from names:

```js
// mirage/factories/user.js
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  name() {
    return faker.name.findName();
  },

  username() {
    return this.name.replace(' ', '').toLowerCase();
  }

});
```

Calling `server.createList('user', 3)` with this factory would generate this data:

```js
[
  { id: '1', name: 'Retha Donnelly', username: 'rethadonnelly' }
  { id: '2', name: 'Crystal Schaefer', username: 'crystalschaefer' }
  { id: '3', name: 'Jerome Schoen', username: 'jeromeschoen' }
]
```


### Relationships

In the same way that you use the ORM to create relational data, as this example from the _Creating and editing related data_ section of the {{docs-link 'ORM guide' 'docs.data-layer.orm'}} illustrates

```js
let nolan = schema.people.create({ name: 'Christopher Nolan' });

schema.movies.create({
  director: nolan,
  title: 'Interstellar',
});
```

you can also create relational data with your factories:

```js
let nolan = server.create('director', { name: 'Christopher Nolan' });

server.create('movie', {
  director: nolan,
  title: 'Interstellar'
});
```

`nolan` is a model instance, which is why we can just pass it in as an attribute override when creating the Interstellar movie.

This also works when using `createList`:

```js
server.create('actor', {
  movies: server.createList('movie', 3)
});
```

In this way you use factories to help you quickly create graphs of relational data:

```js
server.createList('user', 5).forEach(user => {
  server.createList('post', 10, { user }).forEach(post => {
    server.createList('comment', 5, { post });
  });
});
```

This code generates 5 users, each of which has 10 posts with each post having 5 comments. Assuming these relationships are defined in your models, all the foreign keys would be set correctly in Mirage's database.


### The afterCreate hook

In many cases, setting up relationships manually (as shown in the previous section) is perfectly fine. However there are times where it makes more sense to have base case relationships set up for you automatically.

Enter `afterCreate`. It's a hook that's called after a model has been created using the factory's base attributes. This hook lets you perform additional logic on your newly-created models before they're returned from `create` and `createList`.

Let's see how it works.

Say you have these two models in your app:

```js
// mirage/models/user.js
export default Model.extend({
});

// mirage/models/post.js
export default Model.extend({
  post: belongsTo()
});
```

Let's further suppose that in your app, it is never valid to create a post without an associated user.

You can use `afterCreate` to enforce this behavior:

```js
// mirage/factories/post.js
export default Factory.extend({

  afterCreate(post, server) {
    post.update({
      user: server.create('user')
    });
  }

});
```

The first argument to `afterCreate` is the object that was just created (in this case the `post`), and the second is a reference to the Mirage server instance, so that you can invoke other factories or inspect any other server state needed to customize your newly-created object.

In this example we're immediately creating a user for this post. That way elsewhere in your app (say a test), you could just create a post

```js
server.create('post');
```

and you'd be working with a valid record, since that post would have an associated user.

Now, there's one problem with the way we've implemented this so far. Our `afterCreate` hook updates the post's user _regardless if that post already had a user associated with it_.

That means that this code

```js
let tomster = server.create('user', 'Tomster');
server.createList('post', 10, { user: tomster });
```

would not work as we expect, since the attribute overrides while the object is being created, but the logic in `afterCreate` runs _after_ the post has been created. Thus, this post would be associated with the newly created post from the hook, rather than Tomster.

To fix this, we can update our `afterCreate` hook to first check if the newly created post already has a user associated with it. Only if it doesn't will we create a new one and update the relationship.

```js
// mirage/factories/post.js
export default Factory.extend({

  afterCreate(post, server) {
    if (!post.user) {
      post.update({
        user: server.create('user')
      });
    }
  }

});
```

Now callers can pass in specific users

```js
server.createList('post', 10, { user: tomster });
```

or omit specifying a user if the details of that user aren't important

```js
server.create('post');
```

and in both cases they'll end up with a valid record.

`afterCreate` can also be used to create `hasMany` associations, as well as apply any other relevant creation logic.


### Traits

Traits are an important feature of factories that make it easy to group related attributes. Define them by importing `trait` and adding a new key to your factory.

For example, here we define a trait named `published` on our post factory:

```js
// mirage/factories/post.js
import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({
  title: 'Lorem ipsum',

  published: trait({
    isPublished: true,
    publishedAt: '2010-01-01 10:00:00'
  })
});
```

You can pass anything into `trait` that you can into the base factory.

We can use our new trait by passing in the name of the trait as a string argument to `create` or `createList`:

```js
server.create('post', 'published');
server.createList('post', 3, 'published');
```

The created posts will have all the base attributes, as well as everything under the `published` trait.

You can also compose multiple traits together:

```js
// mirage/factories/post.js
import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({
  title: 'Lorem ipsum',

  published: trait({
    isPublished: true,
    publishedAt: '2010-01-01 10:00:00'
  }),

  official: trait({
    isOfficial: true
  })
});
```

We can pass our new traits into `create` or `createList` in any order:

```js
let officialPost = server.create('post', 'official');
let officialPublishedPost = server.create('post', 'official', 'published');
```

If multiple traits set the same attribute, the last trait wins.

As always, you can pass in an object of attribute overrides as the last argument:

```js
server.create('post', 'published', { title: 'My first post' });
```

When combined with the `afterCreate()` hook, traits simplify the process of setting up related object graphs.

Here we define a `withComments` trait that creates 3 comments for a newly created post:

``` js
// mirage/factories/user.js
import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({
  name: 'Lorem ipsum',

  withComments: trait({
    afterCreate(post, server) {
      server.createList('comment', 3, { post });
    }
  })
});
```

We can use this trait to quickly make 10 posts with 3 comments each:

```js
server.createList('post', 10, 'withComments');
```

Combining traits with the `afterCreate` hook is one of the most powerful features of Mirage factories. Effective use of this technique will dramatically simplify the process of creating different graphs of relational data for your app.


### The association helper

The `association()` helper provides some sugar for creating `belongsTo` relationships.

As we saw earlier, given a `Post` that `belongsTo` a `User`, we were able to use the `afterCreate` hook to pre-wire that relationship:

```js
// mirage/factories/post.js
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  afterCreate(post, server) {
    if (!post.user) {
      post.update({
        user: server('user')
      });
    }
  }

});
```

The `association()` helper effectively replaces this code:

```js
// mirage/factories/post.js
import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({

  user: association()

});
```

This should help reduce some of the boilerplate in your factory definitions.

You can also use `association()` within traits

```js
// mirage/factories/post.js
import { Factory, association, trait } from 'ember-cli-mirage';

export default Factory.extend({

  withUser: trait({
    user: association()
  })

});
```

and it also accepts additional traits and overrides for the related model's factory:

```js
// mirage/factories/post.js
import { Factory, association, trait } from 'ember-cli-mirage';

export default Factory.extend({

  withUser: trait({
    user: association('admin', { role: 'editor' })
  })

});
```

There is no equivalent helper for `hasMany` relationships, so you can continue to use the `afterCreate` hook to seed those relationships.


## Using factories

### In development

To use your factories to seed your development database, call `server.create` and `server.createList` in your `scenarios/default.js` file:

```js
// mirage/scenarios/default.js
export default function(server) {
  server.createList('movie', 10);
}
```

There's no explicit API for switching scenarios in development, but you can just use JavaScript modules to split things up.

For example, you could create a new file for each scenario that contains some seeding logic

```js
// mirage/scenarios/admin.js
export default function(server) {
  server.create('user', { isAdmin: true });
}
```

...export all scenarios as an object from an `index.js` file

```js
// mirage/scenarios/index.js
import anonymous from './anonymous';
import subscriber from './subscriber';
import admin from './admin';

export default scenarios = {
  anonymous,
  subscriber,
  admin
}
```

...and then import that object into `default.js`.

Now you can quickly switch your development state by changing a single variable:

```js
// mirage/scenarios/default.js
import scenarios from './index';

// Choose one
const state =
  // 'anonymous'
  // 'subscriber'
  'admin'
;
export default function(server) {
  scenarios[state](server);
}
```

This can be handy while developing your app or sharing the different states of a new feature with your team.


### In testing

When running your app in the `test` environment, your entire Mirage server is loaded, _except_ for your `scenarios/default.js` file.

That means each test starts out with a clean database, giving you the opportunity to set up only the state needed for that test. It also keeps your development scenarios isolated from your tests, so that you don't inadvertently break your test suite while tweaking your development scenario.

To seed Mirage's database within a test, use `this.server` to access the `create` and `createList` methods:

```js
test('I can see the movies on the homepage', async function(assert) {
  this.server.createList('movie', 5);

  await visit('/');

  assert.dom('li.movie').exists({ length: 5 });
});
```

In this test, we start our Mirage server out with 5 movies. Then we boot up the Ember app and visit the `/` route, and finally assert that those movies show up in our UI.

When we write another test, the database will start out empty so that none of Mirage's state leaks across tests.

You can read more about testing with Mirage in the {{docs-link 'Testing' 'docs.testing.acceptance-testing'}} section of these guides.


## Factory best practices

In general, it's best to define a model's base factory using only the attributes and relationships that comprise the minimal valid state for that model. You can then use `afterCreate` and traits to define other common states that contain valid, related changes on top of the base case.

This advice goes a long way towards keeping your test suite maintainable.

If you don't use traits and `afterCreate`, your tests will become bogged down in irrelevant details related to setting up the data needed for that test.

```js
test('I can see the title of a post', async function(assert) {
  let session = server.create('session');
  let user = server.create('user', { session });
  server.create('post', {
    user,
    title: 'My first post',
    slug: 'my-first-post'
  });

  await visit('/post/my-first-post');

  assert.dom('h1').hasText('My first post');
});
```

This test is only concerned with asserting the title of a post gets rendered to the screen, but it has lots of boilerplate code that's only there to get the post in a valid state.

If we used `afterCreate` instead, the developer writing this test could simply create a post with a specified `title` and `slug`, since those are the only details relevant to the test:

```js
test('I can see the title of a post', async function(assert) {
  server.create('post', {
    title: 'My first post',
    slug: 'my-first-post'
  });

  await visit('/post/my-first-post');

  assert.dom('h1').hasText('My first post');
});
```

`afterCreate` could take care of setting up the session and user in valid states, and associating the user with the post, so that the test can stay concise and focused on what it's actually testing.

Effective use of traits and `afterCreate` keeps your test suite less brittle and more robust to changes in your data layer, since tests only declare the bare minimum setup logic needed to verify their assertions.

---

Up next, we'll take a look at how to use Fixtures as an alternative way to seed your database.
