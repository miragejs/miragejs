# Mirage 0.3.0 beta series

I've started the beta series of Mirage v0.3.0. You can install the latest release (0.3.0-beta.4 as of this writing) with

```sh
ember install ember-cli-mirage@beta
```

Recent updates to the ORM required some breaking changes, which is why I'm bumping Mirage's "major" version from 0.2 to 0.3. I'm hoping this is the last release series before landing a 1.0 final.

- [Motivation](#motivation)
- [Usage](#usage)
- [Examples](#examples)
- [Roadmap](#roadmap)

## Motivation

The ORM that was added in 0.2 has proved useful, and recent factory enhancements (the `afterCreate` hook along with traits and associations) have really improved the ergonomics of creating complex object graphs.

The biggest challenge since the 0.2 release has been the ORM's lack of support for several relationship types:

  - one-way
  - one-to-one
  - many-to-many
  - reflexive
  - polymorphic

I went ahead with the 0.2.0 release anyway, because the serialization layer made working with JSON:API so much more pleasant. However, ever since the release users have been forced to write custom code in order to deal with these missing relationship types.

When I began work on these missing types several months ago, I expected it to be relatively simple. Mirage's ORM was based off of ActiveRecord, and I felt I had a good understanding of the APIs that needed to be implemented. I started with one-to-one relationships, and nearly finished before I encountered a fundamental problem.

In Rails, relationships are mapped on top of databases. Databases have fixed, known schemas, and ActiveRecord's APIs are designed to work with these known quantities. Questions like which records have foreign keys and whether two models are related via has-one or has-many are unambiguous, so ActiveRecord's API doesn't need to account for this.

Modern HTTP APIs, however, are quite different. For example, take the following totally valid JSON:API response:

```json
{
  "data": {
    "id": "1",
    "type": "authors",
    "attributes": {
      "name": "Martin Fowler"
    },
    "relationships": {
      "books": {
        "data": [
          {
            "id": "1",
            "type": "books"
          }
        ]
      }
    }
  },
  "included": [{
    "type": "books",
    "id": "1",
    "attributes": {
      "title": "Refactoring: Improving the Design of Existing Code"
    }
  }]
}
```

We can see that an author `has many` books. But what about the relationship from books to authors? In the response it's ambiguous. We might assume it's many-to-one - but we could be wrong. Perhaps our app has the book _Refactoring_, which four authors. So the relationship between authors and book could turn out to be many-to-many.

This is just one example of the ambiguity inherent in many HTTP responses. Trying to make assumptions about the underlying schema can make Mirage's abstractions even more complicated. In the 0.2 ORM, the `hasMany` and `belongsTo` helpers always assumed one side of the relationship was "belongs to", and added a foreign key to it. In the above example, this would mean books would get an `authorId` key. But with the need for many to many relationships, this turns out to be wrong. What to do?

We could have kept the `authorId` as a default assumption, and then changed it when the user specified both sides. But what if the relationship turned out to be only one-way? You often come across this as well. Even if your backend has the relationship mapped out unambiguously, your API may choose to expose only one side. So, more assumptions like this give rise to even more indirection and unnecessary complexity.

Further, keeping a foreign key on the belongs-to side at the database level but adding an ids array to the has-many side at the ORM level is an abstraction, and something else developers need to learn. Understanding Mirage's database structure is still useful for seeding test data and writing test assertions. And the abstractions needed to support all relationship types would be even more complex.

Putting the `authorId` foreign key on a book when the user only ever needed an author to have many books (and therefore a `bookIds: []` array) turned out to be too confusing, and too much magic. If the user specifies that an author has many books, I decided that an author should simply get a `bookIds: []` array to manage the foreign keys — and nothing more. This decision automatically allows for relationships to be one-way only, and it also expands to support the other relationship types. In the event that there _is_ a bidirectional relationship, the keys would now need to be kept in sync on both sides - which is precisely what I've been working on, and is now handled in the 0.3 series. Further, giving models an `id` or `ids` property that corresponds directly to their relationships more closely matches Ember Data's approach. Overall, it feels like the right decision.

## Usage

The `hasMany` and `belongsTo` helpers are still present in 0.3, but they work a bit differently.

Say we have the following models:

```js
// mirage/models/author.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({

  books: hasMany()

});
```

```js
// mirage/models/book.js
import { Model } from 'ember-cli-mirage';

export default Model.extend({

});
```

The `hasMany` helper adds a `bookIds` array to each author model that it uses for bookkeeping. If we have an author instance

```js
let author = schema.authors.find(1);
```

then the helper method `author.books` will use the `author.bookIds` property to find the related books.

Creating related books updates the `ids` property

```js
let steinbeck = schema.authors.create({ name: 'John Steinbeck' });

steinbeck.createBook({ title: 'Of Mice and Men' });
steinbeck.createBook({ title: 'The Grapes of Wrath' });

steinbeck.bookIds; // [ 1, 2 ]
```

as does associating new books

```js
let hemingway = schema.authors.create({ name: 'Ernest Hemingway' });
let oldMan = schema.books.create({ title: 'The Old Man and the Sea' });

hemingway.books = [ oldMan ];
hemingway.save();

hemingway.bookIds; // [ 3 ]
```

Notice that so far, _books themselves don't have any knowledge of this relationship_. This is the biggest change in the ORM. Before, the book would automatically get an `authorId`, and so this would be available in tests, and it would also be sent over in responses as a relationship on the book. But in the case of 0.3, the relationship helpers are one-way. Basically, it works more like Ember Data does.

This means if you want a book to have an `authorId`, you'll need to also define the relationship on the book:

```js
// mirage/models/book.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({

  author: belongsTo()

});
```

This helper will add an `authorId` to the book, and, like Ember Data, look for an implicit inverse on the `author`. If it can find one, the ORM will keep the ids on both sides of the relationship in sync.

## Examples

Here are some Twiddles showcasing various relationship configurations:

- **[One-Way Has Many](https://ember-twiddle.com/802cd2f92e8c6c7280f42b054f393097?openFiles=mirage.config.js%2C)**. Notice how the author's keys are updated when you delete a book.
- **[One-Way Belongs To](https://ember-twiddle.com/24d6101792f2932e9c7edf5f0934b02c?openFiles=models.book.js%2C)**. Deleting the author will ensure existing book's keys are nulled out (i.e. they become orphans so that the database is kept consistent).
- **[One to Many](https://ember-twiddle.com/5031fb20898b277fa6aea8fe89571148?openFiles=templates.application.hbs%2C)**. The keys on both sides of the relationship are kept in sync. If you delete the author, the books become orphaned records with null keys.
- **[One to One](https://ember-twiddle.com/012bd753cb03c7ae375210d47b623ccb?openFiles=mirage.config.js%2C)**. Another bidirectional relationship with keys managed on both sides.
- **[Many to Many](https://ember-twiddle.com/104407460799f1c16c4c0dc88daf975a?openFiles=templates.application.hbs%2C)**. And another.

## Roadmap

Here are my plans for Mirage's next steps. First, after enough folks try out the beta series we can land 0.3. Then I'll be able to add polymorphic relationships, which will round out the ORM.

At this point I'd like to move towards a 1.0 release, barring any glaring issues in the API. Mirage has been around for nearly two years and plenty of people are using it. It's past time we hit an official major version and lock down the API.

After 1.0, I'd like to move forward on an Ember Data integration layer, which is now possible since Mirage's ORM is able to represent Ember Data's possible schemas. The layer would simply read in your application's Ember Data schema and reproduce it in-memory for Mirage's ORM to use. This would yield big ergonomic gains for users of the library, as you'd no longer need to duplicate your Ember Data models for Mirage, and also lower the learning curve for new users.

There are several more features I want to move forward on now that the core API is stabilizing. Getting Mirage to be able to run in Node in an Express server would be great, since responses would be real HTTP responses, developers could use the network tab and more.

My primary goal in 2017 is delegation. For too long my personal availability has been a bottleneck for Mirage's development. I am going to focus on finding contributors and planning instead of actual implementation. It should help move the library forward faster while getting more folks knowledgeable about the internals, while also freeing up my time to focus more on [my business](https://embermap.com/).

If you'd like to help, join #ec-mirage on Ember's slack community and reach out! Also be sure to drop a message there or open an issue if you have any feedback on 0.3.

I'm so happy to be part of such an awesome community and look forward to seeing you at SoEmber and EmberConf. Here's to an exciting 2017!
