# Mirage 0.2.0-beta.9 released

Mirage v0.2.0-beta.9 has been released. Check out [the release notes](https://github.com/samselikoff/ember-cli-mirage/releases/tag/v0.2.0-beta.9) for the breaking changes and enhancements.

## Update on a 0.2 stable release

I wanted to jot down some of my recent thoughts while putting this release together. Pardon the rambling.

Originally I had planned for beta.9 to be the last beta release before cutting 0.2. Since folks have started using the 0.2 beta series, however, pain points around data modeling have been cropping up. In particular, dealing with `has-one` and `many-to-many` associations is quite difficult with the current set of abstractions.

My first thought was to ship 0.2 as is, and then work on adding helpers for `hasAndBelongsToMany` and `hasOne`. After some more thought & discussions with various users, I realized that the ORM's abstractions might be a touch off. Let me explain.

Mirage's ORM was built to support features like JSON:API includes and the planned factory relationships. The ORM is a way to encode association information, since there was no good place to do this in `v0.1`. My approach was to largely mimic server-side frameworks like Rails, since they've already solved this problem. After all, your models already live on the backend in database tables, so why not use the same concepts? Tables with foreign keys are familiar to backend devs, so let's just emulate those concepts in Mirage.

So, that's been the plan so far. The ORM has working `hasMany` and `belongsTo` associations, and those take care of many cases. The `manyToMany` case is interesting, though, because there's not necessarily a standard conventional way that all Ember developers or servers approach this problem.

Take a simple `belongsTo`, like a `post` that belongs to an `author`. The `post` probably owns the foreign key, something like `author_id`. Persisting this relationship, then, is as simple as saving any other attribute on the `post`:

```
PUT /api/posts/1

{
  post: {
    id: 1,
    title: 'Hipster ipsum',
    author_id: 24
  }
}
```

`author_id` is all that's needed to tell both Ember Data and the server about the new relationship.

`hasMany` is where things start to get tricky. Let's assume we've also defined the inverse of the above relationship, so an `author` has many `posts`. If you updated an author with new posts, how would you persist those new relationships?

As above, the foreign key on each `post` is all that's needed to tell both the frontend and the backend about the new relationship, so typically I would handle it like this:

```js
post1.set('author', author);
post1.save();

post2.set('author', author);
post2.save();
```

and so on. You can write code that batches these requests, but the point here is that this is pretty straightforward stuff. Persisting a relationship is just boring old CRUD on a resource.

Interestingly, the [Ember Data guides](https://guides.emberjs.com/v2.5.0/models/relationships/#toc_creating-records) show code that suggests persisting a `hasMany` relationship by calling `save` on the parent, which looks something like this:

```js
author.get('posts').pushObjects([post1, post3]);
author.save();
```

Now, Ember Data can understand this, and in fact this is how some teams work. But what does the request/response look like? Maybe something like

```
PUT /authors/1
{
  author: {
    id: 1,
    name: 'Frank',
    post_ids: [1, 3]
  }
}
```

This is a request to update a single `author` resource - but behind the scenes, is your backend actually updating the foreign keys on two different post records? If so, we've kind of moved out of the realm of doing boring CRUD on resources, because now our server is doing something different or more than what we asked of it: we asked it to update the `author:1` resource, and in reality it's updating two other `post` resources. Interestingly I've asked several folks in the community how they deal with this issue, and the response varies.

The story gets even trickier with many-to-many relationships. Sometimes people model the join record in their Ember apps, sometimes they don't. If they don't, a PUT to an `author` resource could actually be *creating* multiple server resources behind the scenes, via a join table.

This obviously has implications for Mirage, which works best with conventional server endpoints. A PUT to a resource updates that resource, and so on. But plenty of people write their servers this way, and it got me thinking: perhaps database tables and foreign keys are the wrong abstraction for Mirage to emulate. Perhaps transport of HTTP resources is a bit more generic and abstract than that.

Take, for example, the following Ember Data model definitions:

```js
// models/post.js
export default DS.Model.extend({

  categories: DS.hasMany();

});

// models/category.js
export default DS.Model.extend({

  name: DS.attr()

});
```

That is a perfectly valid and legitimate domain model. By looking at those two models, can you tell me which entity owns the foreign key? Nope. In fact, you don't even know if this is a one-to-many or many-to-many relationship. And yet, from the perspective of HTTP resources (including a valid implementation of a JSON:API server), this is totally valid.

Here's the JSON:API response, for example:

```
GET /posts/1?include=categories

{
  data: {
    type: 'posts',
    id: 1,
    relationships: {
      categories: [
        {
          data: {
            type: 'categories',
            id: '2'
          }
        },
        {
          data: {
            type: 'categories',
            id: '5'
          }
        }
      ]
    }
  },
  included: [
    {
      type: 'categories',
      id: '2',
      attributes: {
        name: 'Economics'
      }
    },
    {
      type: 'categories',
      id: '5',
      attributes: {
        name: 'Programming'
      }
    }
  ]
}
```

Totally valid, and also impossible to ascertain whether this is a one-to-many or many-to-many relationship.

Basing Mirage's ORM on database tables and foreign keys makes some things really easy and familiar, but for these situations it's a pain. If your actual Ember app and your actual server can handle a request like

```
PUT /posts/1
{
  post: {
    id: 1,
    tag_ids: [1, 4]
  }
}
```

just fine, you shouldn't have to add extra logic or models to make your fake Mirage server work.

The solution I have in mind for this problem is to replace the foreign key implementation with an associations map. This map will be a singleton that all models will have a reference to, and it will be used to persist model relationships.

The external API of Mirage's ORM won't change. For example, say you had a `author` that has many `posts`:

```js
// mirage/models/author.js
export default Model.extend({
  posts: hasMany()
});

// mirage/models/post.js
export default Model.extend({
});
```

Currently (in 0.2.0-beta.9), Mirage makes an assumption here that the `post` resource has an `author_id` foreign key. As we've just shown, this is potentially a false assumption. My previous plan was to write a `hasAndBelongsToMany` helper for many-to-many relationships. Then, if this relationship turned out to be a many-to-many, the user would need to do something like the following:

```js
// mirage/models/author.js
export default Model.extend({
  posts: hasAndBelongsToMany()
});
```

This would tell Mirage to transparently create a `author-post` join table, and deal with the persistence there.

Again, this now feels like the wrong abstraction, and it also introduces concepts that aren't necessarily appropriate for the domain of the frontend. Instead, the original domain model with the `hasMany` declaration will add an `author.posts` key to the singleton associations map, where all the relationship data can be stored. This has an added benefit of simplifying Mirage's interface for creating relationships in factories and elsewhere, as now developers will be able to do things like

```js
let author = server.create('author', {
  categoryIds: [1, 3]
});
```

in their tests, similar to what they're used to doing in Ember Data. We can also make Mirage's shorthands understand both forms of saving `hasMany` relationships, since the ids on the models will just be pointers to the associations map. Serializers can be used to customize which ids are sent along with the response.

This change will also make it easier to ascertain all model information from an existing set of Ember Data models in the future. I'm confident the overall learning curve will be easier and resulting code will be cleaner.

While this will take a bit more time to get right, I think it's important. I also feel like I have a better grasp of something important, namely that Mirage as an HTTP faking layer should not necessarily emulate various server abstractions, but rather focus on concepts that come from HTTP. It turns out that single-owner foreign keys is not one of those concepts, and therefore this abstraction does not belong in Mirage.

I'll probably release 0.2, and work the associations map into a 0.3 release. Still thinking this through, though.

My closing thought is that these HTTP concepts are crucial to understand if you're going to write an Ember app, and they can't just be left to the backend team. It's true that a frontend developer doesn't need to know that Rails has a `has_and_belongs_to_many` method that abstracts away join tables on many-to-many relationships; however, the developer does need to understand how her Ember app will retrieve and persist many-to-many relationships across the network. Domain modeling and HTTP transport is a central part of Ember development and unfortunately at the moment, many parts of it are still non-standard and unconventional.
