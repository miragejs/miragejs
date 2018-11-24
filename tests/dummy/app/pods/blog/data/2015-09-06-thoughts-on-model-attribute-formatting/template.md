# Thoughts on model attribute formatting

permalink: /blog/2015/09/06/thoughts-on-model-attribute-formatting/

I ran into an interesting problem while working on the serializer layer. I was just wrapping up AMS-style responses and was going to start working on the JSON:API version, when a wrinkle came up: the formatting of attribute names, both on Mirage's model layer instances, and on the field names of Mirage's database.

Currently, Mirage's database simply takes whatever POJO of attrs you give it, and sticks that in its db. So if you write

```js
db.users.create({ first_name: 'Link' })
```

then you'll end up with that POJO in the db, but if you use `first-name`, you'll get that instead. This was originally done to make things as simple as possible - your db fields matched your API responses, so fixtures would "just work", and accessing the data is as you'd expect based on your API.

When I introduced the model layer, I added attr accessors that simply matched the keys in the db. But right now, it's a naive implementation that just wraps the db attrs. So, if you're working with a `user` model (e.g. in your route handler), you would either access `user.first_name` or `user['first-name']`, depending on how your database looked.

It seems like attrs on models should be consistently camelCase. One would expect to write `user.firstName` on a JavaScript model. That's the convention. I *could* keep the model's attrs in the format of your API (i.e. whatever's in your db), so we'd have something like `user.first_name`. But, what happens when you switch your app over to JSON:API? Now, you have to rewrite all the custom parts of your Mirage server, since it's now `user['first-name']` in JSON:API. That's pretty crappy. Not to mention, the dynamic methods added by the model layer, like `user.createPost`, should probably be consistent across API formats.

So, I think models should have camelCase attributes. That way you're always using camelCase, regardless of the format of your API - which makes sense, since you're writing a (mock) JavaScript server.

This presents an interesting challenge. How should the db fields be formatted? There's three ways to create db data. Fixture files, factories, and using the ORM in a route handler (e.g. `schema.user.create(...)`). The latter two seem like they should be camelCase (again, you don't want to have to update all your factories if you change from AMS to JSON:API...you may have to update some parts of your routes). But fixtures should always "just work".

This leads me to think there should be a part of the "serializer layer" that can deserialize an API payload and get the attrs for the model(s), or at least in some way standardize it. This would mean if you change your API, you'd be able to use new fixture files just by specifying your new serializer. Also, it'd make the shorthands more versatile - they could basically use your serializers to deserialize the payload, and then they'd be able to create/update/delete the appropriate models regardless of your API format. Right now, they are coupled to AMS-style responses.

I'll have to think more about this, but right now this feels like the right move.
