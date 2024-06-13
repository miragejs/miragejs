import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import { Model, hasMany, belongsTo } from "miragejs";

describe("Integration | ORM | Schema Verification | Mixed", function () {
  test("unnamed one-to-many associations are correct", () => {
    let schema = new Schema(
      new Db({
        wordSmiths: [{ id: 1, name: "Frodo" }],
        blogPosts: [{ id: 1, title: "Lorem" }],
      }),
      {
        wordSmith: Model.extend({
          blogPosts: hasMany(),
        }),
        blogPost: Model.extend({
          wordSmith: belongsTo(),
        }),
      }
    );

    let frodo = schema.wordSmiths.find(1);
    let association = frodo.associationFor("blogPosts");

    expect(association.name).toBe("blogPosts");
    expect(association.modelName).toBe("blog-post");
    expect(association.ownerModelName).toBe("word-smith");

    let post = schema.blogPosts.find(1);

    expect(post.inverseFor(association)).toEqual(
      post.associationFor("wordSmith")
    );
  });

  test("a named one-to-many association is correct", () => {
    let schema = new Schema(
      new Db({
        wordSmiths: [{ id: 1, name: "Frodo" }],
        blogPosts: [{ id: 1, title: "Lorem" }],
      }),
      {
        wordSmith: Model.extend({
          posts: hasMany("blog-post"),
        }),
        blogPost: Model.extend({
          author: belongsTo("word-smith"),
        }),
      }
    );

    let frodo = schema.wordSmiths.find(1);
    let association = frodo.associationFor("posts");

    expect(association.name).toBe("posts");
    expect(association.modelName).toBe("blog-post");
    expect(association.ownerModelName).toBe("word-smith");

    let post = schema.blogPosts.find(1);

    expect(post.inverseFor(association)).toEqual(post.associationFor("author"));
  });

  test("multiple has-many associations of the same type", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
      }),
      {
        user: Model.extend({
          notes: hasMany("post", { inverse: "author" }),
          messages: hasMany("post", { inverse: "messenger" }),
        }),
        post: Model.extend({
          author: belongsTo("user", { inverse: "notes" }),
          messenger: belongsTo("user", { inverse: "messages" }),
        }),
      }
    );

    let frodo = schema.users.find(1);
    let notesAssociation = frodo.associationFor("notes");

    expect(notesAssociation.name).toBe("notes");
    expect(notesAssociation.modelName).toBe("post");
    expect(notesAssociation.ownerModelName).toBe("user");

    let post = schema.posts.find(1);

    expect(post.inverseFor(notesAssociation)).toEqual(
      post.associationFor("author")
    );

    let messagesAssociation = frodo.associationFor("messages");

    expect(messagesAssociation.name).toBe("messages");
    expect(messagesAssociation.modelName).toBe("post");
    expect(messagesAssociation.ownerModelName).toBe("user");

    expect(post.inverseFor(messagesAssociation)).toEqual(
      post.associationFor("messenger")
    );
  });

  test("one-to-many reflexive association is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
      }),
      {
        user: Model.extend({
          parent: belongsTo("user", { inverse: "children" }),
          children: hasMany("user", { inverse: "parent" }),
        }),
      }
    );

    let frodo = schema.users.find(1);
    let parentAssociation = frodo.associationFor("parent");

    expect(parentAssociation.name).toBe("parent");
    expect(parentAssociation.modelName).toBe("user");
    expect(parentAssociation.ownerModelName).toBe("user");

    expect(frodo.inverseFor(parentAssociation)).toEqual(
      frodo.associationFor("children")
    );
  });

  test("one-to-many polymorphic association is correct", () => {
    let schema = new Schema(
      new Db({
        authors: [{ id: 1, name: "Peter" }],
        posts: [{ id: 1, title: "Lorem" }],
        articles: [{ id: 1, title: "Ipsum" }],
      }),
      {
        author: Model.extend({
          writings: hasMany({ polymorphic: true }),
        }),
        post: Model.extend({
          author: belongsTo("author", { inverse: "writings" }),
        }),
        article: Model.extend({
          author: belongsTo("author", { inverse: "writings" }),
        }),
      }
    );

    let author = schema.authors.find(1);
    let writingsAssociation = author.associationFor("writings");

    let post = schema.posts.find(1);
    let postAuthorAssociation = post.associationFor("author");

    let article = schema.articles.find(1);
    let articleAuthorAssociation = article.associationFor("author");

    expect(post.inverseFor(writingsAssociation)).toEqual(postAuthorAssociation);
    expect(article.inverseFor(writingsAssociation)).toEqual(
      articleAuthorAssociation
    );
    expect(author.inverseFor(postAuthorAssociation)).toEqual(
      writingsAssociation
    );
    expect(author.inverseFor(postAuthorAssociation)).toEqual(
      writingsAssociation
    );
  });

  test("multiple implicit inverse associations with the same key throws an error", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
      }),
      {
        user: Model.extend({
          posts: hasMany("post"),
        }),
        post: Model.extend({
          editor: belongsTo("user"),
          authors: hasMany("user"),
        }),
      }
    );

    let frodo = schema.users.find(1);
    let userPostsAssociation = frodo.associationFor("posts");
    let post = schema.posts.find(1);

    expect(function () {
      post.inverseFor(userPostsAssociation);
    }).toThrow();
  });

  test("multiple explicit inverse associations with the same key throws an error", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
      }),
      {
        user: Model.extend({
          posts: hasMany("post", { inverse: "authors" }),
        }),
        post: Model.extend({
          editor: belongsTo("user", { inverse: "posts" }),
          authors: hasMany("user", { inverse: "posts" }),
        }),
      }
    );

    let frodo = schema.users.find(1);
    let userPostsAssociation = frodo.associationFor("posts");
    let post = schema.posts.find(1);

    expect(function () {
      post.inverseFor(userPostsAssociation);
    }).toThrow();
  });

  test("explicit inverse is chosen over implicit inverses", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
      }),
      {
        user: Model.extend({
          posts: hasMany("post", { inverse: "authors" }),
        }),
        post: Model.extend({
          editor: belongsTo("user"),
          authors: hasMany("user", { inverse: "posts" }),
        }),
      }
    );

    let frodo = schema.users.find(1);
    let userPostsAssociation = frodo.associationFor("posts");

    expect(userPostsAssociation.name).toBe("posts");
    expect(userPostsAssociation.modelName).toBe("post");
    expect(userPostsAssociation.ownerModelName).toBe("user");

    let post = schema.posts.find(1);

    expect(post.inverseFor(userPostsAssociation)).toEqual(
      post.associationFor("authors")
    );
  });

  test("multiple explicit inverse associations with the same key but different models does not throw an error", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
        books: [{ id: 1, title: "Ipsum" }],
      }),
      {
        user: Model.extend({
          authoredPosts: hasMany("post", { inverse: "authors" }),
          authoredBooks: hasMany("book", { inverse: "authors" }),
        }),
        post: Model.extend({
          authors: hasMany("user", { inverse: "authoredPosts" }),
        }),
        book: Model.extend({
          authors: hasMany("user", { inverse: "authoredBooks" }),
        }),
      }
    );

    let frodo = schema.users.find(1);
    let post = schema.posts.find(1);
    let book = schema.books.find(1);

    let userAuthoredPostsAssociation = frodo.associationFor("authoredPosts");
    let userAuthoredBooksAssociation = frodo.associationFor("authoredBooks");
    let postsAuthorsAssociation = post.associationFor("authors");
    let bookAuthorsAssociation = book.associationFor("authors");
    expect(post.inverseFor(userAuthoredPostsAssociation)).toEqual(
      post.associationFor("authors")
    );
    expect(book.inverseFor(userAuthoredBooksAssociation)).toEqual(
      book.associationFor("authors")
    );
    expect(frodo.inverseFor(postsAuthorsAssociation)).toEqual(
      frodo.associationFor("authoredPosts")
    );
    expect(frodo.inverseFor(bookAuthorsAssociation)).toEqual(
      frodo.associationFor("authoredBooks")
    );
  });
});
