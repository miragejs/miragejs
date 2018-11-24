# The ORM is not ready, yet

permalink: /blog/2015/09/10/orm-not-ready-yet/

I wanted to quickly note that, although [the models PR](https://github.com/samselikoff/ember-cli-mirage/pull/82) has been merged into master, it is not quite ready for use. To be really effective, Mirage also needs a serializer layer (in progress), and an update to the factory layer (to support associations and traits).

My plan is to document all three of these features (models, serializers and updated factories) at once, since they all rely on the orm, and will all require you to write simple model definitions to take advantage of.

Once you add a model definition, say by defining an `author` model

```js
// mirage/models/author.js
export default Mirage.Model.extend({
  posts: Mirage.hasMany()
});
```

then you opt into the orm. Now, routes will get a `schema` object injected instead of a `db` (the `db` will be accessible via `schema.db`), and shorthands and factories will leverage the `schema`, and you'll be able to use serializers as well.

I've hit some snags writing serializers, and there's a lot of hidden complexity in this effort, but I'm hoping I can wrap this all up in the next few weeks.
