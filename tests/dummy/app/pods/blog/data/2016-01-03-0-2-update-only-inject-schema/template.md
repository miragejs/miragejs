# Mirage 0.2 update

permalink: /blog/2016/01/03/0-2-update-only-inject-schema/

Here's a quick update on Mirage 0.2.

When I started working on the ORM/Serializer layer, I knew we were going to need to bump Mirage to 0.2. However, I thought it was worth keeping the library completely backwards compatible. I wanted users to be able to update to 0.2 without breaking any of their existing route handlers.

The more I learned while developing, the more I realized some of the assumptions I made in 0.1 were simply bad. For example, using the formatting of fixture files (including their names) to determine the format of JSON responses from mocked routes.

Now that we have a proper ORM and serializer layer, I'd like the story for how to set up your mock server to be clear, especially to newcomers.

In 0.1, route handlers receive the `db` as the first argument:

```js
this.get('/users', (db, request) => {
  return db.users;
});
```

This made sense in a world where there was only a `db`, acting as a dumb data store, and all formatting decisions were left up to the user.

Then, we added the ORM and Serializer. Originally, the idea was, if you defined your models - that is, if you opted in to Mirage's ORM - we'd inject a `schema` object instead of the comparatively dumb `db`:

```js
this.get('/users', (schema, request) => {
  return schema.user.all();
});
```

This returned a User Collection, which the Serializer layer knew how to serialize.

This has been working well - but obviously, this is a breaking change for old route handlers. I also wanted people to be able to opt-in to the ORM layer, but still be able to dive into the raw `db` if they ever wanted to. `db` is an object that hangs directly off of `schema`, so you can always access it, even if you've opted in to the ORM:

```js
this.get('/users', (schema, request) => {
  return schema.db.users;
});
```

This would bypass the model-specific serializers.

ES6 destructring makes this even better:

```js
this.get('/users', ({db}) => {
  return db.users;
});
```

Given this, I feel it's worth making the breaking change, and *only* injecting `schema` to route handlers. The upgrade path for existing route handlers should be a simple change:

```diff
- this.get('/users', (db) => {
+ this.get('/users', ({db}) => {
    return db.users;
  });
```

along with possibly specifying a default Application serializer.

The main reason I want to make this change, is to simplify the story around how Mirage data gets set up. In 0.1, Mirage looked for defined fixtures and/or factories to set up its database. In traditional server frameworks (e.g. Rails), you have a `schema` file that specifies the schema of your db. Using a mixture of fixtures and factories is confusing and unnecessary. Further, factories should be seen as an extension of the models (db collections) they're creating, rather than their definitions.

This is why going forward, the story for configuring Mirage will be a unified one: Models define your schema/database. So, new users will define models for each table/collection they want in their Mirage mock server. That sets up the database tables, and also gives the user a very easy starting point when they *do* want to opt into the relationship/serializer support. `server.create` will still use a factory if it exists, but if no factory exists, it will simply create an empty model.

I'm confident this change will make Mirage simpler and more approachable. The downside is, existing users will need to define blank models for each collection they have. We'll have a generator, which will help some, but this could prove to be annoying. My hope is that having a single `/models` directory, while being able to delete empty factory and fixture files, will simplify things. Also, this paves the way for a planned future addon, `mirage-ember-data`. The purpose of this addon is to ascertain, at run-time, the server models and their relationships, based on a user's Ember Data models. This would eliminate the need to define models again, in Mirage-land.

This addon is still a ways off, but this change - enforcing users to simply define their models as the single source of truth for their backend schema - paves the way.

---

You can see all the open items left before we release 0.2.0 [here](https://github.com/samselikoff/ember-cli-mirage/issues?q=is%3Aopen+is%3Aissue+milestone%3A0.2.0). Bugs, Help Wanted and Good for New Contributors are great tags to look out for if you'd like to help push us towards release!

If you have any thoughts or comments, tweet @samselikoff or [open an issue](https://github.com/samselikoff/ember-cli-mirage/issues).
