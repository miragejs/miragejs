# Upgrading

## Updating your version of Mirage

To install a new version of Mirage, run

```sh
npm install ember-cli-mirage@X.X.X --save-dev
ember g ember-cli-mirage
```

The `ember g ember-cli-mirage` command ensures all of Mirage's Bower dependencies are added to your project. It runs during `ember install`, and it's always a good idea to run it when upgrading.

Use `ember-cli-mirage@beta` to get the latest beta.

## Changelog

You can view Mirage's full Changelog here:

[https://github.com/samselikoff/ember-cli-mirage/blob/master/CHANGELOG.md](https://github.com/samselikoff/ember-cli-mirage/blob/master/CHANGELOG.md)

## 0.2.x > 0.3 Upgrade guide

The main change from 0.2.x to 0.3.x is that relationships are now one-way. This better matches the semantics of both Ember Data and common HTTP transfer protocols like JSON:API.

In 0.2, the following model definitions

```js
// mirage/models/author.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({

});

// mirage/models/post.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({

  author: belongsTo()

});
```

would have generated a "schema" with a one-to-many relationship between authors and posts: an author has many posts, and a post belongs to an author. Now, this just generates a one-way relationship from `post` to `author`. To have a two-way sync'd relationship, known as an inverse, you'd need to define both sides of the relationship:

```js
// mirage/models/author.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({

  posts: hasMany()

});

// mirage/models/post.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({

  author: belongsTo()

});
```

Practically speaking, to upgrade you'll need to go through your code and update relationships that implicitly had inverses (from 0.2.x's hasMany and belongsTo behavior) and update them to define both sides.

This could also affect your fixture files, if you are using those to seed your database. Instead of just having an authorId on the post above, for example, you'd also need the author to have a `postIds: []` array. (In general Factories are better for seeding your database, as they save you from having to manage ids at all.)

Conceptually this change should be straightforward, as its making existing implicit relationships explicit, but if you find yourself having trouble with the upgrade it's probably because of something I haven't thought of. Please reach out to the community on the #ec-mirage channel on Slack and ask for help!

For more information on the motivation behind change, please read the [0-3 beta series release blog post](http://www.ember-cli-mirage.com/blog/2017/01/09/0-3-0-beta-series/).

## 0.1.x > 0.2 Upgrade guide

If you're upgrading your Mirage server from v0.1.x to v0.2.x, here's what you need to know:

  - **The default Mirage directory has changed.** The default Mirage directory has moved from `/app/mirage` to `/mirage`. When you install 0.2.0, the default blueprint will add the `/mirage` directory to your project. You can delete it and move your current Mirage files to the new location with something like

    ```sh
    rm -rf mirage
    mv app/mirage mirage
    ```

    from the root of your project. Mirage's directory is also [customizable](../configuration/#directory) (Although you should move it from the `/app` directory or else it will not be removed from the build in production mode).

  - **All multiword filenames are dasherized.** In Mirage 0.1.x, database collection names were taken from filenames. The idea was, if your API returned snake_case collection keys (e.g. `blog_posts: []`), just name your file `fixtures/blog_posts.js`. This approach turned out to be insufficiently flexib-- what am I saying, it was just a bad idea :P.

    In Mirage 0.2.x, we follow Ember CLI's conventions of dasherized filenames. So, you'll just need to go through and change

    ```sh
    /mirage/factories/blog_post.js
    /mirage/fixtures/blog_post.js
    # etc.
    ```

    to

    ```sh
    /mirage/factories/blog-post.js
    /mirage/fixtures/blog-post.js
    ```

    You will then use the [new Serializer layer](../serializers) to do things like format keys in your json payloads.

  - **All JavaScript properties are camelCased.** Similar to the previous change, factory properties and database collection names followed the format of your API in Mirage 0.1.x. If you were faking an ActiveModelSerializer backend, multiword keys used snake_case throughout your Mirage code. So, your database table might be `db.blog_posts`, and your factory keys might be `first_name() {..}`. Looks pretty cool right?

    Wrong. We're JavaScript developers here, people. It's time to start using camelCase. (Also, the idea of tying these keys to your serialization format was bad, as it left us without any conventions. We need to stick to a single format, so the ORM knows how to find foreign keys.)

    You'll need to update your route handlers, which may look like this:

    ```js
    let posts = db.blog_posts.filter(p => p.author_id === 1);
    ```

    to

    ```js
    let posts = db.blogPosts.filter(p => p.authorId === 1);
    ```

    Note that everything is camelCased, including foreign keys.

    Similarly, factories that look like

    ```js
    export default Factory.extend({
      first_name() {
        return faker.name.firstName();
      },

      last_name() {
        return faker.name.firstName();
      },
    });
    ```

    should be changed to

    ```js
    export default Factory.extend({
      firstName() {
        return faker.name.firstName();
      },

      lastName() {
        return faker.name.firstName();
      },
    });
    ```

    This goes for all attrs that `server.create` takes (and returns), etc. For many this will be the most painful part of the upgrade. Please find it in your heart to forgive me.

  - **Mirage now has its own Model layer (an ORM).** In Mirage 0.1.x, you had to define either a factory or a fixture file (or both) in order for a database collection to be created, which let you take advantage of the db in your route handlers. In 0.2, we've introduced Mirage Models, which serve as the new canonical source of truth about your database.

    To create a model, use

    ```
    ember g mirage-model blog-post
    ```

    This will create a file like

    ```js
    import { Model } from 'ember-cli-mirage';

    export default Model.extend({

    });
    ```

    Having that file sets up the `db.blogPosts` collection, allows you to use the JSON:API serializer, and more. You can still define factories and fixtures - but only if you need them. <!-- not yet! in 0.6.0 For instance, given the model above, `server.create('blog-post')` would create a blank `blog-post` model. You could then make a factory for models that need more customization. --> Models, factories and fixtures all work together, but now you won't be making blank factory or fixture files just to set up your database. The models themselves serve as the source of truth.

    We needed to add models for [association support](../models/#associations) (which currently exists) and factory relationships (the first feature to come after the 0.2 release). Read through the [models guide](../models) and [serializers guide](../serializers) to see how having models can simplify your Mirage server.

    We also have a plan to make a separate addon that could ascertain your model definitions and their relationships from your Ember Data models. Adding the ORM paves the way for this important future addition.

    Currently, Mirage will still work if a factory/fixture file is defined for a particular db collection without a corresponding model. Eventually, we may require all setups to have model definitions for each collection. But for now, to make for an easier upgrade path, you can start generating models and opt-in to the ORM layer in piecemeal.

- **The ORM object `schema` is now injected into route handlers.** In Mirage 0.1.x, the `db` was the first parameter injected into route handlers:

  ```js
  this.get('/posts', function(db, request) {
    // work with db
  });
  ```

  Now, the `schema` object is, so you can take advantage of the Model layer. Fortunately, the `db` hangs directly off of the `schema`, so you can leave all your old route handler code intact (with the exception of making the change to camelCase), and just use destructuring to change the function signature to

  ```js
  this.get('/posts', function({ db }, request) {
    // work with db
  });
  ```

  and then start opting-in to the ORM (and using `schema`) one route handler at a time.

- **Specify a Serializer.** If you're using shorthands, you'll need to pick a serializer in `/mirage/serializers/application.js`. See the [serializers guide](../serializers) for details.

---

You can always view the [full changelog](https://github.com/samselikoff/ember-cli-mirage/blob/master/CHANGELOG.md) to see everything that's changed. If you think this guide missed a critical part of the upgrade path, please [open an issue](https://github.com/samselikoff/ember-cli-mirage/issues/new) or [help improve it](https://github.com/samselikoff/ember-cli-mirage/edit/gh-pages/docs/v0.3.x/upgrading.md)!
